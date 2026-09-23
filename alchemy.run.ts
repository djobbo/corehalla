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
 * `web/vite.config.ts` must not add `@cloudflare/vite-plugin` or Nitro itself.
 *
 * The database is a single Cloudflare D1 (SQLite) database. Alchemy applies the
 * generated Drizzle migrations from `packages/db/drizzle` at deploy (and to the
 * local simulator under `alchemy dev`), then binds it to the Worker as `DB` —
 * `web/src/env.ts` reads `env.DB` and `db/client.ts` wraps it for Effect SQL.
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
 * Deploy (the `pnpm` scripts load `.env` and `web/.env` into the process):
 *   pnpm deploy
 *
 * Alchemy's own credentials (`CLOUDFLARE_ACCOUNT_ID` / `CLOUDFLARE_API_TOKEN`, or
 * an `alchemy profile`) belong in the repo-root `.env`; the app secrets
 * (`DISCORD_*`, `BRAWLHALLA_API_KEY`, `SITE_URL`) belong in `web/.env`, which is
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
                "web/.env (loaded by `pnpm dev:cloud` / `pnpm deploy`) or export it.",
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
 * SSR loads its data by calling the API handler in-process (`web/src/server.ts`
 * installs that client), so this is only used if that client is missing: in
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

export class Website extends Cloudflare.Website.Vite<Website>()(
    "CorehallaWeb",
    {
        // The app lives in `web/`; Vite's root, its config and the file-hash
        // scope used for rebuild detection all resolve from here.
        rootDir: "./web",
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
            // The Worker reads `env.DB` (see web/src/env.ts).
            DB: CorehallaDb,
            SITE_URL: siteUrl,
            // Inlined into the server bundle for the SSR self-fetch origin.
            VITE_SITE_URL: siteUrl,
            INTERNAL_ORIGIN: internalOrigin,
            DISCORD_CLIENT_ID: env("DISCORD_CLIENT_ID", "", true),
            DISCORD_CLIENT_SECRET: Redacted.make(
                env("DISCORD_CLIENT_SECRET", "", true),
            ),
            BRAWLHALLA_API_KEY: Redacted.make(
                env("BRAWLHALLA_API_KEY", "", true),
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

        return {
            url: website.url.as<string>(),
            databaseId: db.databaseId,
        }
    }),
)
