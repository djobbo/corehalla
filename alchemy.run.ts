import * as Alchemy from "alchemy"
import { adopt } from "alchemy/AdoptPolicy"
import * as Cloudflare from "@alchemy.run/cloudflare"
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
        const uiHostname = `ui.${hostname}`

        if (!isDev) {
            // WAF is zone-scoped while the CMS is a subdomain. Adopt the
            // existing zone instead of trying to create it.
            const zone = yield* Cloudflare.Zone.Zone("CorehallaZone", {
                name: yield* setting("CLOUDFLARE_ZONE", "corehalla.com"),
            }).pipe(adopt(true))

            // This owns the entire custom-firewall phase entrypoint. Any
            // existing custom rules must be represented in `rules` here.
            yield* Cloudflare.Ruleset.Ruleset("CmsApiSkipChallenge", {
                zone,
                phase: "http_request_firewall_custom",
                name: "cms-api-skip-challenge",
                description: "Skip edge challenges for CMS automation",
                rules: [
                    {
                        description: "Skip WAF and bot checks for CMS APIs",
                        expression: `http.host eq "cms.${hostname}" and (starts_with(lower(http.request.uri.path), "/_emdash/api/") or starts_with(lower(http.request.uri.path), "/api/public/"))`,
                        action: "skip",
                        actionParameters: {
                            ruleset: "current",
                            phases: [
                                "http_request_firewall_managed",
                                "http_request_sbfm",
                            ],
                            products: [
                                "waf",
                                "securityLevel",
                                "bic",
                                "hot",
                                "uaBlock",
                                "rateLimit",
                                "zoneLockdown",
                            ],
                        },
                    },
                ],
            })
        }

        // Read replication stays off so session reads are not served stale.
        const dbResource = Cloudflare.D1.Database("CorehallaDb", {
            name: "corehalla",
            migrations: "packages/db/drizzle",
            importFiles,
        })
        // EmDash owns its core schema; it migrates D1 on first request.
        const cmsDbResource = Cloudflare.D1.Database("CorehallaEmDashDb", {
            name: "corehalla-emdash",
        })
        const cmsMediaResource = Cloudflare.R2.Bucket("CorehallaMedia", {
            name: "corehalla-media",
        })
        const cmsResource = Cloudflare.Website.Astro("CorehallaCms", {
            rootDir: `${import.meta.dirname}/apps/cms`,
            name: "corehalla-cms",
            domain: `cms.${hostname}`,
            env: {
                DB: cmsDbResource,
                MEDIA: cmsMediaResource,
                IMAGES: Cloudflare.Images.Images("IMAGES"),
                // Explicit canonical origin: behind a proxy the request
                // origin can be the internal http:// Worker URL.
                EMDASH_SITE_URL: `https://cms.${hostname}`,
            },
        })
        const cms = isDev ? undefined : yield* cmsResource
        const cmsDevUrl = "http://localhost:3002"

        const apiResource = Cloudflare.Worker("CorehallaApi", {
            name: "corehalla-api",
            main: "apps/api/src/index.ts",
            routes: [{ pattern: `${hostname}/api/v1/*` }],
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
                ...(cms === undefined
                    ? { CMS_DEV_URL: cmsDevUrl }
                    : { CMS: cmsResource }),
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
            },
        })
        const db = yield* dbResource
        const api = yield* apiResource
        const crawler = yield* crawlerResource
        const crawlQueue = yield* CorehallaCrawlQueue
        const sampleQueue = yield* CorehallaSampleQueue

        // web-next is now the main web app. It keeps its own worker name so
        // the old `corehalla-web` worker is removed in the same apply.
        const website = yield* Cloudflare.Website.Vite("CorehallaWebNext", {
            rootDir: "./apps/web-next",
            dev: { port: DEV_PORT },
            compatibility: {
                flags: ["enable_request_signal"],
            },
            name: "corehalla-web-next",
            domain: hostname,
            env: {
                API: apiResource,
                DB: dbResource,
                // `/static/*` proxies CMS media. Same dev split as the API.
                ...(cms === undefined
                    ? { CMS_DEV_URL: cmsDevUrl }
                    : { CMS: cmsResource }),
                SITE_URL: setting("SITE_URL", "https://corehalla.com"),
                VITE_SITE_URL: siteUrl,
                INTERNAL_ORIGIN: internalOrigin,
                DISCORD_CLIENT_ID: setting("DISCORD_CLIENT_ID"),
                DISCORD_CLIENT_SECRET: secret("DISCORD_CLIENT_SECRET"),
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

        // The component catalogue, built by `storybook build` and served as
        // static assets on its own subdomain. Under `alchemy dev` it runs the
        // Storybook dev server instead, so the workshop and the app share one
        // command. It reads only the public roster art, so it binds nothing.
        const storybook = yield* Cloudflare.Website.StaticSite(
            "CorehallaWebNextStorybook",
            {
                cwd: "./apps/web-next",
                command: "vp run build-storybook",
                outdir: "storybook-static",
                name: "corehalla-web-next-storybook",
                domain: uiHostname,
                dev: {
                    command: "vp run storybook",
                    url: "http://localhost:6006",
                },
            },
        )

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
            cmsUrl: cms === undefined ? cmsDevUrl : cms.url,
            storybookUrl: storybook.url,
            apiUrl: api.url,
            crawlerUrl: crawler.url,
            databaseId: db.databaseId,
        }
    }),
)
