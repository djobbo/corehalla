import { existsSync, readdirSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import * as Alchemy from "alchemy"
import * as Cloudflare from "alchemy/Cloudflare"
import * as Effect from "effect/Effect"
import * as Redacted from "effect/Redacted"

/**
 * Cloudflare deployment for the whole workspace — lives at the repo root, so
 * `alchemy dev` / `alchemy deploy` are run from here and every path below is
 * repo-relative.
 *
 * `Cloudflare.Website.Vite` builds the `web` app's Vite `ssr` environment into a
 * Worker plus static assets; Alchemy supplies the Cloudflare plugin, so
 * `apps/web/vite.config.ts` must not add `@cloudflare/vite-plugin` or Nitro itself.
 *
 * The database is a single Cloudflare D1 (SQLite) database. Alchemy applies the
 * generated Drizzle migrations from `packages/db/drizzle` at deploy (and to the
 * local simulator under `alchemy dev`), then binds it to the Worker as `DB` —
 * `apps/web/src/env.ts` reads `env.DB` and `packages/db/client.ts` wraps it for Effect SQL.
 *
 * Data import is opt-in and one-off:
 *
 *   pnpm db:seed                            # synthetic data
 *   pnpm db:import:supabase                 # old Supabase -> SQL files
 *   IMPORT_SUPABASE_SEED=1 pnpm deploy      # ingest them via the D1 import API
 *
 * `IMPORT_SUPABASE_SEED=1` attaches the generated files to `importFiles`, which
 * Cloudflare ingests in order, hash-tracked, so the flag can be dropped again
 * afterwards. `pnpm db:seed --file=...` + `wrangler d1 execute` still works and
 * is the path used for the synthetic seed.
 *
 * Deploy (the `pnpm` scripts load `.env` and `apps/web/.env` into the process):
 *   pnpm deploy
 *
 * Alchemy's own credentials (`CLOUDFLARE_ACCOUNT_ID` / `CLOUDFLARE_API_TOKEN`, or
 * an `alchemy profile`) belong in the repo-root `.env`; the app secrets
 * (`DISCORD_*`, `BRAWLHALLA_API_KEY`, `SITE_URL`) belong in `apps/web/.env`, which is
 * also what `vp dev` reads. Both are loaded by `pnpm dev:cloud` / `pnpm deploy`
 * via `node --env-file-if-exists`, so a plain `alchemy deploy` needs the values
 * exported instead.
 */

/**
 * Reads a deployment value from the process environment.
 *
 * `required` only warns: the stack must still evaluate for `alchemy dev` and for
 * `alchemy destroy`, where an empty value is harmless or irrelevant.
 */
const env = (key: string, fallback: string, required = false): string => {
    const value = process.env[key]

    if (value !== undefined && value !== "") return value

    if (required) {
        console.warn(
            `Warning: ${key} is not set — deploying an empty value. Add it to ` +
                "apps/web/.env (loaded by `pnpm dev:cloud` / `pnpm deploy`) or export it.",
        )
    }

    return fallback
}

/** The repo root — this file's directory. */
const repoRoot = dirname(fileURLToPath(import.meta.url))
const supabaseSeedDir = "packages/db/seed/generated/supabase"

/**
 * The generated Supabase export, only when the one-off import is requested.
 *
 * The files are large and gitignored, so this must never be an unconditional
 * prop: a deploy without them (CI) would fail while reading them. Removing the
 * prop later only drops the recorded hashes — it never deletes imported rows.
 */
const supabaseImportFiles = (() => {
    if (process.env["IMPORT_SUPABASE_SEED"] !== "1") return undefined

    const directory = resolve(repoRoot, supabaseSeedDir)

    if (!existsSync(directory)) {
        throw new Error(
            `IMPORT_SUPABASE_SEED=1 but ${directory} does not exist. ` +
                "Run `pnpm db:import:supabase` first.",
        )
    }

    return readdirSync(directory)
        .filter((file) => file.endsWith(".sql"))
        .sort()
        .map((file) => `${supabaseSeedDir}/${file}`)
})()

/**
 * The D1 database.
 *
 * Read replication is left off on purpose: sessions are read on every
 * authenticated request and a lagging replica would serve stale sessions.
 */
export const CorehallaDb = Cloudflare.D1.Database("CorehallaDb", {
    // Stable name so `wrangler d1 execute corehalla --file=...` works for the
    // one-off seed import.
    name: "corehalla",
    migrations: "packages/db/drizzle",
    importFiles: supabaseImportFiles,
})

const siteUrl = env("SITE_URL", "https://corehalla.com")

/** Alchemy's local Vite dev server (see the `dev` prop below). */
const DEV_PORT = 1337
const isDev = process.env["ALCHEMY_DEV"] === "true"

/**
 * Fallback origin for the server-side render.
 *
 * SSR loads its data through the `API` service binding (`apps/web/src/server.ts`
 * installs that client), so this is only used if the binding is missing: in
 * production `SITE_URL` is this deployment, under `alchemy dev` the app is
 * served by Alchemy's local dev server instead.
 */
const internalOrigin = isDev ? `http://localhost:${DEV_PORT}` : siteUrl

/**
 * The Worker's public hostname, derived from `SITE_URL` so the custom domain and
 * the app's own origin cannot drift apart (`SITE_URL` also drives the OAuth
 * redirect and the canonical URLs).
 *
 * Alchemy attaches it as a Cloudflare custom domain and manages the DNS record
 * and the edge certificate; the zone is inferred from the hostname and must
 * already exist in the account.
 */
const hostname = siteUrl.replace(/^https?:\/\//, "").replace(/\/+$/, "")

/**
 * The KV namespace backing the API worker's read-through cache.
 *
 * KV is chosen for the *eventual consistency* that makes it unsuitable for the
 * rate limiter: cached upstream payloads tolerate a stale read, so a value
 * written in one colo may lag in another without mattering. The cache also has
 * an in-isolate tier, so a missing namespace degrades rather than breaks.
 */
export const CorehallaCache = Cloudflare.KV.Namespace("CorehallaCache", {
    title: "corehalla-api-cache",
})

/**
 * The queue the crawl cron produces onto, consumed by the API worker.
 *
 * A queue rather than a loop inside the cron handler for two reasons: the
 * scheduled invocation only produces, so it cannot run into the CPU limit
 * walking 20 ladders; and each ladder becomes an independent delivery that can
 * be retried on its own, instead of one failure discarding the whole pass.
 */
export const CorehallaCrawlQueue = Cloudflare.Queues.Queue(
    "CorehallaCrawlQueue",
    {
        name: "corehalla-crawl",
    },
)

/**
 * The API worker (`@crh/api`).
 *
 * Owns the Effect `HttpApi` served at `/api/v1/*`, the Brawlhalla upstream
 * calls, and the D1-backed ranking/alias/guild queries. It shares `CorehallaDb`
 * with the web worker.
 *
 * Two choices are deliberate:
 *
 * - The route pattern puts the API on the *site hostname* rather than a
 *   subdomain. The browser calls it directly (the route atoms fetch
 *   client-side), so a separate origin would need CORS; same-origin does not.
 * - It is bound into the web worker as `API` so server-side rendering reaches
 *   it over a service binding. A Worker's subrequest to its own public hostname
 *   is answered with a managed bot challenge, which is what the previous
 *   in-process handler existed to work around.
 *
 * `BRAWLHALLA_API_KEY` belongs here and not on the web worker: nothing under
 * `apps/web` talks to Brawlhalla any more.
 *
 * The crawler is a *separate* worker (`CorehallaCrawler` below), so this one
 * serves traffic only. Neither the cron nor the queue producer lives here.
 */
export const CorehallaApi = Cloudflare.Worker("CorehallaApi", {
    name: "corehalla-api",
    main: "apps/api/src/index.ts",
    routes: [{ pattern: `${hostname}/api/v1/*` }],
    compatibility: {
        flags: ["enable_request_signal"],
    },
    env: {
        DB: CorehallaDb,
        CACHE: CorehallaCache,
        // Cloudflare's own rate-limiting binding: a Worker-only binding with no
        // backing resource to provision.
        //
        // The limit is a burst damper, not a meter. It is enforced per colo and
        // is only eventually consistent, so the aggregate across colos can
        // exceed this number — Cloudflare documents the API as protection
        // against overwhelming an upstream rather than as exact accounting.
        // 10/min per colo sits far above normal traffic once the cache is warm
        // (a handful of requests a minute) and well below a flood.
        RATE_LIMITER: Cloudflare.RateLimit("RATE_LIMITER", {
            namespaceId: 1001,
            simple: { limit: 10, period: 60 },
        }),
        SITE_URL: siteUrl,
        BRAWLHALLA_API_KEY: Redacted.make(env("BRAWLHALLA_API_KEY", "", true)),
    },
})

/**
 * The crawler worker (`@crh/crawler`).
 *
 * Split out from the API so the two stop contending for one upstream allowance.
 *
 * Worth being precise about what that does and does not buy. The v1 limit is
 * **per IP**, and Workers egress from shared Cloudflare addresses, so two
 * Workers do not receive two allowances — Brawlhalla sees Cloudflare's egress
 * pool either way. What the split does buy is control: each worker has its own
 * budget we can pace independently, the crawler can no longer consume the share
 * reserved for user requests, and a long crawl cannot affect request latency or
 * share a failure domain with the API.
 *
 * It has no route and no `fetch` handler, so it is unreachable from the
 * internet. No `RATE_LIMITER` either: the crawler paces itself rather than
 * passing through the cache's damper, which exists to protect user traffic.
 */
export const CorehallaCrawler = Cloudflare.Worker("CorehallaCrawler", {
    name: "corehalla-crawler",
    main: "apps/crawler/src/index.ts",
    // Every thirty minutes: one queue delivery per ladder, one page each.
    //
    // Sized from the v1 allowance of 2,000 requests per 15 minutes. A *team*
    // page costs double, because a team rating is not a player's own 1v1 rating:
    // each member's ranked record is fetched separately, so 2v2 and 3v3 pages
    // cost 1 + 2 × players. With 3v3 the matrix is 30 targets at ~2,530 requests
    // a pass — 126% of the allowance per ten minutes, and ~63% per thirty,
    // leaving the remainder for user traffic that misses the cache.
    crons: ["*/30 * * * *"],
    compatibility: {
        flags: ["enable_request_signal"],
    },
    env: {
        DB: CorehallaDb,
        // The crawler writes what it fetches into the same namespace the API
        // reads, which is the point of warming it.
        CACHE: CorehallaCache,
        // Producer side of the crawl queue. The consumer is registered below,
        // once both the worker and the queue have resolved to real names.
        CRAWL_QUEUE: CorehallaCrawlQueue,
        SITE_URL: siteUrl,
        BRAWLHALLA_API_KEY: Redacted.make(env("BRAWLHALLA_API_KEY", "", true)),
    },
})

export class Website extends Cloudflare.Website.Vite<Website>()(
    "CorehallaWeb",
    {
        // The app lives in `apps/web`; Vite's root, its config and the file-hash
        // scope used for rebuild detection all resolve from here.
        rootDir: "./apps/web",
        // Keep the dev port explicit: `internalOrigin` above refers to it.
        dev: { port: DEV_PORT },
        compatibility: {
            // `nodejs_compat` is on by Alchemy's default compatibility date; this
            // only adds the request-signal plumbing.
            flags: ["enable_request_signal"],
        },
        name: "corehalla-web",
        domain: hostname,
        env: {
            // The Worker reads `env.DB` (see apps/web/src/env.ts).
            DB: CorehallaDb,
            SITE_URL: siteUrl,
            // Inlined into the server bundle for the SSR self-fetch origin.
            VITE_SITE_URL: siteUrl,
            INTERNAL_ORIGIN: internalOrigin,
            DISCORD_CLIENT_ID: env("DISCORD_CLIENT_ID", "", true),
            DISCORD_CLIENT_SECRET: Redacted.make(
                env("DISCORD_CLIENT_SECRET", "", true),
            ),
            // Service binding to the API worker, used for server-side data
            // loading. The browser reaches the same worker over the public
            // `/api/v1/*` route instead.
            API: CorehallaApi,
            VITE_ADSENSE_SLOT_PROFILE_HEADER: env(
                "VITE_ADSENSE_SLOT_PROFILE_HEADER",
                "",
                true,
            ),
            VITE_ADSENSE_SLOT_PROFILE_BOTTOM: env(
                "VITE_ADSENSE_SLOT_PROFILE_BOTTOM",
                "",
                true,
            ),
            VITE_ADSENSE_SLOT_ARTICLES: env(
                "VITE_ADSENSE_SLOT_ARTICLES",
                "",
                true,
            ),
            VITE_ADSENSE_SLOT_RANKINGS: env(
                "VITE_ADSENSE_SLOT_RANKINGS",
                "",
                true,
            ),
            VITE_ADSENSE_SLOT_LANDING: env(
                "VITE_ADSENSE_SLOT_LANDING",
                "",
                true,
            ),
        },
    },
) {}

export type WebsiteEnv = Cloudflare.InferEnv<typeof Website>

export default Alchemy.Stack(
    "Corehalla",
    {
        providers: Cloudflare.providers(),
        // Remote state, shared by CI and local runs. Use `Alchemy.localState()`
        // for a purely local, file-backed deploy.
        state: Cloudflare.state(),
    },
    Effect.gen(function* () {
        const website = yield* Website
        const db = yield* CorehallaDb
        const api = yield* CorehallaApi
        const crawler = yield* CorehallaCrawler
        const crawlQueue = yield* CorehallaCrawlQueue

        /**
         * The UX study (`@crh/web-next`).
         *
         * Deployed so it can be looked at on a real device, but **without a
         * custom domain**: no `domain` prop means Alchemy attaches nothing to
         * the zone, so no DNS record or edge certificate is involved and the app
         * is reachable at its `workers.dev` URL. That keeps an in-progress UX
         * from holding a hostname.
         *
         * Defined here rather than as a class because its API origin is the API
         * worker's own resolved URL, which only exists once that resource has
         * been yielded. Writing the origin down — the site hostname in
         * production, a guessed port in dev — is the thing this avoids: under
         * `alchemy dev` the port is assigned by Alchemy, so any literal would be
         * a coincidence that breaks the moment it changes.
         *
         * The browser cannot use a relative `/api/v1/*` path: this worker serves
         * no API, so a relative call would hit itself. An absolute origin makes
         * every call cross-origin, which is why the API worker sends CORS
         * headers — and, usefully, in dev as well as production, so a CORS
         * mistake shows up locally instead of only after a deploy.
         */
        const websiteNext = yield* Cloudflare.Website.Vite("CorehallaWebNext", {
            rootDir: "./apps/web-next",
            name: "corehalla-web-next",
            env: {
                VITE_API_ORIGIN: api.url.as<string>(),
            },
        })

        // Registered here rather than on the Worker because a consumer needs
        // both the queue's id and the worker's script name, and those are
        // outputs that only exist after both resources resolve.
        //
        // The consumer is the *crawler* worker, not the API: a queue delivery is
        // crawl work, and routing it through the request worker would put the
        // crawl back on the API's budget and failure domain.
        //
        // Serialised on purpose: the constraint the crawler works against is the
        // upstream request budget, so concurrent deliveries would contend for
        // the same allowance rather than finishing sooner.
        yield* Cloudflare.Queues.Consumer("CorehallaCrawlConsumer", {
            queueId: crawlQueue.queueId,
            scriptName: crawler.workerName,
            settings: {
                batchSize: 1,
                maxConcurrency: 1,
                maxRetries: 3,
                // Long enough to cover a page's paced fetches; a retry that
                // fires mid-crawl would duplicate work the upserts make harmless
                // but the budget still pays for.
                retryDelay: 60,
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
