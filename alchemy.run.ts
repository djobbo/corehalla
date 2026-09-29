import * as Alchemy from "alchemy"
import * as Cloudflare from "alchemy/Cloudflare"
import { ConfigError } from "effect/Config"
import * as Config from "effect/Config"
import * as ConfigProvider from "effect/ConfigProvider"
import * as Effect from "effect/Effect"
import * as FileSystem from "effect/FileSystem"
import * as Path from "effect/Path"
import * as Redacted from "effect/Redacted"

/**
 * Cloudflare stack for the workspace. Paths are repo-relative.
 * `Website.Vite` supplies the Cloudflare plugin, so the app configs must not
 * add `@cloudflare/vite-plugin` themselves.
 *
 * Worker settings are `Config` values. Alchemy reads them from the repo-root
 * `.env` (`dev` / `deploy` / `destroy` pass `--env-file .env`) and binds them
 * onto the Worker.
 */

const supabaseSeedDir = "packages/db/seed/generated/supabase"

const configError = (message: string, cause?: unknown) =>
    new ConfigError(
        new ConfigProvider.SourceError({
            message,
            cause,
        }),
    )

const setting = (key: string, fallback = "") =>
    Config.String(key).pipe(Config.withDefault(fallback))

const secret = (key: string) =>
    Config.Redacted(key).pipe(Config.withDefault(Redacted.make("")))

/** Opt-in: the SQL is gitignored. Dropping `importFiles` later drops hashes, not rows. */
const supabaseImportFiles = Effect.fnUntraced(function* () {
    const enabled = yield* setting("IMPORT_SUPABASE_SEED")
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
        const siteUrl = yield* setting("SITE_URL", "https://corehalla.com")
        const importFiles = yield* supabaseImportFiles().pipe(
            Effect.mapError((cause) =>
                cause instanceof ConfigError
                    ? cause
                    : configError("Could not list Supabase seed files", cause),
            ),
        )
        const isDev = yield* Alchemy.ALCHEMY_DEV
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
                SITE_URL: setting("SITE_URL", "https://corehalla.com"),
                BRAWLHALLA_API_KEY: secret("BRAWLHALLA_API_KEY"),
                DISCORD_CLIENT_ID: setting("DISCORD_CLIENT_ID"),
                DISCORD_CLIENT_SECRET: secret("DISCORD_CLIENT_SECRET"),
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
                SITE_URL: setting("SITE_URL", "https://corehalla.com"),
                BRAWLHALLA_API_KEY: secret("BRAWLHALLA_API_KEY"),
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
                SITE_URL: setting("SITE_URL", "https://corehalla.com"),
                VITE_SITE_URL: siteUrl,
                INTERNAL_ORIGIN: internalOrigin,
                DISCORD_CLIENT_ID: setting("DISCORD_CLIENT_ID"),
                DISCORD_CLIENT_SECRET: secret("DISCORD_CLIENT_SECRET"),
                API: apiResource,
                VITE_ADSENSE_SLOT_PROFILE_HEADER: setting(
                    "VITE_ADSENSE_SLOT_PROFILE_HEADER",
                ),
                VITE_ADSENSE_SLOT_PROFILE_BOTTOM: setting(
                    "VITE_ADSENSE_SLOT_PROFILE_BOTTOM",
                ),
                VITE_ADSENSE_SLOT_ARTICLES: setting(
                    "VITE_ADSENSE_SLOT_ARTICLES",
                ),
                VITE_ADSENSE_SLOT_RANKINGS: setting(
                    "VITE_ADSENSE_SLOT_RANKINGS",
                ),
                VITE_ADSENSE_SLOT_LANDING: setting("VITE_ADSENSE_SLOT_LANDING"),
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
