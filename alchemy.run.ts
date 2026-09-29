import * as Alchemy from "alchemy"
import * as Cloudflare from "alchemy/Cloudflare"
import { ConfigError } from "effect/Config"
import * as Config from "effect/Config"
import * as ConfigProvider from "effect/ConfigProvider"
import * as Effect from "effect/Effect"
import * as FileSystem from "effect/FileSystem"
import * as Option from "effect/Option"
import * as Path from "effect/Path"
import * as Redacted from "effect/Redacted"

/**
 * Cloudflare stack for the workspace. Paths are repo-relative.
 * `Website.Vite` supplies the Cloudflare plugin, so the app configs must not
 * add `@cloudflare/vite-plugin` themselves.
 *
 * App settings come from Effect Config. The shell wins, then `apps/web/.env`,
 * then `.env`. A missing file is skipped. Required settings only warn, so
 * `dev` and `destroy` still evaluate.
 *
 * Keys the shell did not set are copied onto `process.env`. Vite's dev and
 * build children inherit that, and Alchemy only forwards `VITE_*` entries
 * that are also declared on the worker.
 */

const dotenvFiles = [".env", "apps/web/.env"] as const
const supabaseSeedDir = "packages/db/seed/generated/supabase"

const configError = (message: string, cause?: unknown) =>
    new ConfigError(
        new ConfigProvider.SourceError({
            message,
            cause,
        }),
    )

const assembleConfig = Effect.fnUntraced(function* () {
    const fs = yield* FileSystem.FileSystem
    const preexisting = yield* Effect.sync(
        () => new Set(Object.keys(process.env)),
    )
    const merged = new Map<string, string>()
    let files = ConfigProvider.fromEnv({ env: {} })

    for (const path of dotenvFiles) {
        if (!(yield* fs.exists(path))) continue
        const parsed = yield* ConfigProvider.fromDotEnv({
            path,
            preserveEmptyStrings: true,
        })
        const text = yield* fs.readFileString(path)
        for (const match of text.matchAll(
            /^\s*(?:export\s+)?([\w.-]+)\s*=/gm,
        )) {
            const key = match[1]
            if (key === undefined) continue
            const value = yield* Config.String(key).pipe(
                Config.withDefault(""),
                Effect.provideService(ConfigProvider.ConfigProvider, parsed),
            )
            merged.set(key, value)
        }
        files = ConfigProvider.orElse(parsed, files)
    }

    yield* Effect.sync(() => {
        for (const [key, value] of merged) {
            if (!preexisting.has(key)) process.env[key] = value
        }
    })

    return ConfigProvider.orElse(
        ConfigProvider.fromEnv({ preserveEmptyStrings: true }),
        files,
    )
})

const readSetting = Effect.fnUntraced(function* (
    provider: ConfigProvider.ConfigProvider,
    key: string,
    fallback: string,
    required = false,
) {
    const value = yield* Config.String(key).pipe(
        Config.option,
        Effect.provideService(ConfigProvider.ConfigProvider, provider),
    )
    if (Option.isSome(value) && value.value !== "") return value.value
    if (required) {
        yield* Effect.logWarning(
            `${key} is not set — deploying an empty value. Add it to .env or apps/web/.env, or export it.`,
        )
    }
    return fallback
})

/** Opt-in: the SQL is gitignored. Dropping `importFiles` later drops hashes, not rows. */
const supabaseImportFiles = Effect.fnUntraced(function* (
    provider: ConfigProvider.ConfigProvider,
) {
    const enabled = yield* readSetting(provider, "IMPORT_SUPABASE_SEED", "")
    if (enabled !== "1") return undefined

    const fs = yield* FileSystem.FileSystem
    const path = yield* Path.Path
    const directory = path.resolve(import.meta.dirname, supabaseSeedDir)
    if (!(yield* fs.exists(directory))) {
        return yield* Effect.fail(
            configError(
                `IMPORT_SUPABASE_SEED=1 but ${directory} does not exist. Run \`vp run db:import:supabase\` first.`,
            ),
        )
    }

    const entries = yield* fs.readDirectory(directory)
    return entries
        .map((entry) => path.basename(entry))
        .filter((file) => file.endsWith(".sql"))
        .sort()
        .map((file) => `${supabaseSeedDir}/${file}`)
})

/** Alchemy's local Vite port. `internalOrigin` refers to it under `alchemy dev`. */
const DEV_PORT = 1337

/** Cached payloads tolerate KV's eventual consistency. */
export const CorehallaCache = Cloudflare.KV.Namespace("CorehallaCache", {
    title: "corehalla-api-cache",
})

/**
 * The ladder walk and the activity sampler have separate lanes so neither
 * waits on the other. The walk keeps its original queue name.
 */
export const CorehallaCrawlQueue = Cloudflare.Queues.Queue(
    "CorehallaCrawlQueue",
    {
        name: "corehalla-crawl",
    },
)

/** The sampler's lane. A shared FIFO put every sample behind the walk. */
export const CorehallaSampleQueue = Cloudflare.Queues.Queue(
    "CorehallaSampleQueue",
    {
        name: "corehalla-crawl-samples",
    },
)

export default Alchemy.Stack(
    "Corehalla",
    {
        providers: Cloudflare.providers(),
        // Remote state, shared by CI and local runs.
        state: Cloudflare.state(),
    },
    Effect.gen(function* () {
        const provider = yield* assembleConfig().pipe(
            Effect.mapError((cause) =>
                configError("Could not read .env files", cause),
            ),
        )
        const read = (key: string, fallback: string, required = false) =>
            readSetting(provider, key, fallback, required)
        const siteUrl = yield* read("SITE_URL", "https://corehalla.com")
        const brawlhallaApiKey = yield* read("BRAWLHALLA_API_KEY", "", true)
        const discordClientId = yield* read("DISCORD_CLIENT_ID", "", true)
        const discordClientSecret = yield* read(
            "DISCORD_CLIENT_SECRET",
            "",
            true,
        )
        const adsenseProfileHeader = yield* read(
            "VITE_ADSENSE_SLOT_PROFILE_HEADER",
            "",
            true,
        )
        const adsenseProfileBottom = yield* read(
            "VITE_ADSENSE_SLOT_PROFILE_BOTTOM",
            "",
            true,
        )
        const adsenseArticles = yield* read(
            "VITE_ADSENSE_SLOT_ARTICLES",
            "",
            true,
        )
        const adsenseRankings = yield* read(
            "VITE_ADSENSE_SLOT_RANKINGS",
            "",
            true,
        )
        const adsenseLanding = yield* read(
            "VITE_ADSENSE_SLOT_LANDING",
            "",
            true,
        )
        const importFiles = yield* supabaseImportFiles(provider).pipe(
            Effect.mapError((cause) =>
                cause instanceof ConfigError
                    ? cause
                    : configError("Could not list Supabase seed files", cause),
            ),
        )
        const isDev = yield* Alchemy.ALCHEMY_DEV.pipe(
            Effect.provideService(ConfigProvider.ConfigProvider, provider),
        )
        const internalOrigin = isDev ? `http://localhost:${DEV_PORT}` : siteUrl
        const hostname = siteUrl.replace(/^https?:\/\//, "").replace(/\/+$/, "")
        const nextHostname = `next.${hostname}`

        // Read replication stays off so session reads are not served stale.
        const dbResource = Cloudflare.D1.Database("CorehallaDb", {
            name: "corehalla",
            migrations: "packages/db/drizzle",
            importFiles,
        })
        const apiResource = Cloudflare.Worker("CorehallaApi", {
            name: "corehalla-api",
            main: "apps/api/src/index.ts",
            routes: [
                { pattern: `${hostname}/api/v1/*` },
                { pattern: `${nextHostname}/api/v1/*` },
            ],
            compatibility: {
                flags: ["enable_request_signal"],
            },
            env: {
                DB: dbResource,
                CACHE: CorehallaCache,
                // Per-colo burst damper. Enforcement is eventually consistent,
                // so the global total can exceed this.
                RATE_LIMITER: Cloudflare.RateLimit("RATE_LIMITER", {
                    namespaceId: 1001,
                    simple: { limit: 30, period: 10 },
                }),
                SITE_URL: siteUrl,
                BRAWLHALLA_API_KEY: Redacted.make(brawlhallaApiKey),
                DISCORD_CLIENT_ID: discordClientId,
                DISCORD_CLIENT_SECRET: Redacted.make(discordClientSecret),
            },
        })
        const crawlerResource = Cloudflare.Worker("CorehallaCrawler", {
            name: "corehalla-crawler",
            main: "apps/crawler/src/index.ts",
            // `*/10` samples activity; `*/30` also runs the full crawl.
            crons: ["*/10 * * * *", "*/30 * * * *"],
            compatibility: {
                flags: ["enable_request_signal"],
            },
            env: {
                DB: dbResource,
                CACHE: CorehallaCache,
                CRAWL_QUEUE: CorehallaCrawlQueue,
                CRAWL_SAMPLE_QUEUE: CorehallaSampleQueue,
                SITE_URL: siteUrl,
                BRAWLHALLA_API_KEY: Redacted.make(brawlhallaApiKey),
            },
        })
        const websiteResource = Cloudflare.Website.Vite("CorehallaWeb", {
            rootDir: "./apps/web",
            dev: { port: DEV_PORT },
            compatibility: {
                // `nodejs_compat` is Alchemy's default; this only adds the request signal.
                flags: ["enable_request_signal"],
            },
            name: "corehalla-web",
            domain: hostname,
            env: {
                DB: dbResource,
                SITE_URL: siteUrl,
                VITE_SITE_URL: siteUrl,
                INTERNAL_ORIGIN: internalOrigin,
                DISCORD_CLIENT_ID: discordClientId,
                DISCORD_CLIENT_SECRET: Redacted.make(discordClientSecret),
                API: apiResource,
                VITE_ADSENSE_SLOT_PROFILE_HEADER: adsenseProfileHeader,
                VITE_ADSENSE_SLOT_PROFILE_BOTTOM: adsenseProfileBottom,
                VITE_ADSENSE_SLOT_ARTICLES: adsenseArticles,
                VITE_ADSENSE_SLOT_RANKINGS: adsenseRankings,
                VITE_ADSENSE_SLOT_LANDING: adsenseLanding,
            },
        })

        const website = yield* websiteResource
        const db = yield* dbResource
        const api = yield* apiResource
        const crawler = yield* crawlerResource
        const crawlQueue = yield* CorehallaCrawlQueue
        const sampleQueue = yield* CorehallaSampleQueue

        // Service binding, not a baked origin: `alchemy dev` reassigns the API port.
        const websiteNext = yield* Cloudflare.Website.Vite("CorehallaWebNext", {
            rootDir: "./apps/web-next",
            name: "corehalla-web-next",
            domain: nextHostname,
            env: {
                API: apiResource,
            },
        })

        // Registered after both resources resolve, because a consumer needs the
        // queue id and the worker script name. One invocation per lane: extra
        // concurrency multiplies the shared per-IP upstream rate.
        yield* Cloudflare.Queues.Consumer("CorehallaCrawlConsumer", {
            queueId: crawlQueue.queueId,
            scriptName: crawler.workerName,
            settings: {
                batchSize: 1,
                maxConcurrency: 1,
                maxRetries: 3,
                retryDelay: 60,
            },
        })

        yield* Cloudflare.Queues.Consumer("CorehallaCrawlSampleConsumer", {
            queueId: sampleQueue.queueId,
            scriptName: crawler.workerName,
            settings: {
                batchSize: 1,
                maxConcurrency: 1,
                maxRetries: 3,
                retryDelay: 30,
            },
        })

        return {
            url: website.url,
            nextUrl: websiteNext.url,
            apiUrl: api.url,
            crawlerUrl: crawler.url,
            databaseId: db.databaseId,
        }
    }),
)
