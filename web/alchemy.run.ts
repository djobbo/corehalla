import * as Alchemy from "alchemy"
import * as Cloudflare from "alchemy/Cloudflare"
import * as Effect from "effect/Effect"
import * as Redacted from "effect/Redacted"

/**
 * Cloudflare deployment for the TanStack Start app.
 *
 * `Cloudflare.Website.Vite` builds the Vite `ssr` environment into a Worker plus
 * static assets; Alchemy supplies the Cloudflare plugin, so `vite.config.ts`
 * must not add `@cloudflare/vite-plugin` or Nitro itself.
 *
 * Supabase is only a Postgres host here, so the Worker reaches it through a
 * Hyperdrive connection (pooled TCP). The origin is the Supabase project's
 * **session** endpoint (see the Supabase "Connection pooling" settings); the
 * deploy reads the credentials from the environment it runs in.
 *
 * Deploy:
 *   SUPABASE_DB_HOST=... SUPABASE_DB_USER=... SUPABASE_DB_PASSWORD=... \
 *   DISCORD_CLIENT_ID=... DISCORD_CLIENT_SECRET=... BRAWLHALLA_API_KEY=... \
 *   SITE_URL=https://corehalla.com pnpm --filter web deploy
 *
 * `DATABASE_URL` (used by `pnpm db:migrate`) is the same origin; migrations run
 * from Node/CI because Drizzle's migrator reads the `drizzle/` directory from
 * disk, which a Worker cannot do.
 */

const SUPPORTED_STAGE_ENV = (key: string, fallback: string) =>
    process.env[key] ?? fallback

const origin = {
    scheme: "postgres" as const,
    host: SUPPORTED_STAGE_ENV("SUPABASE_DB_HOST", "127.0.0.1"),
    port: Number(SUPPORTED_STAGE_ENV("SUPABASE_DB_PORT", "54322")),
    database: SUPPORTED_STAGE_ENV("SUPABASE_DB_NAME", "postgres"),
    user: SUPPORTED_STAGE_ENV("SUPABASE_DB_USER", "postgres"),
    password: Redacted.make(SUPPORTED_STAGE_ENV("SUPABASE_DB_PASSWORD", "")),
}

/**
 * Pooled connection to the Supabase Postgres.
 *
 * `dev` points `alchemy dev` at the local Postgres that `pnpm setup:env`
 * starts, so the Worker code path is exercised without touching production.
 * Caching is disabled because sessions must never be read stale.
 */
export const Hyperdrive = Cloudflare.Hyperdrive.Connection("CorehallaDb", {
    origin,
    caching: { disabled: true },
    dev: {
        scheme: "postgres",
        host: "127.0.0.1",
        port: 54322,
        database: "postgres",
        user: "postgres",
        password: Redacted.make("postgres"),
        sslmode: "disable",
    },
})

const siteUrl = SUPPORTED_STAGE_ENV("SITE_URL", "https://corehalla.com")

export class Website extends Cloudflare.Website.Vite<Website>()(
    "CorehallaWeb",
    {
        compatibility: {
            // `nodejs_compat` is on by Alchemy's default compatibility date; this
            // only adds the request-signal plumbing.
            flags: ["enable_request_signal"],
        },
        env: {
            // The Worker reads `env.HYPERDRIVE.connectionString` (see src/env.ts).
            HYPERDRIVE: Hyperdrive,
            SITE_URL: siteUrl,
            // Inlined into the server bundle for the SSR self-fetch origin.
            VITE_SITE_URL: siteUrl,
            INTERNAL_ORIGIN: siteUrl,
            DISCORD_CLIENT_ID: SUPPORTED_STAGE_ENV("DISCORD_CLIENT_ID", ""),
            DISCORD_CLIENT_SECRET: Redacted.make(
                SUPPORTED_STAGE_ENV("DISCORD_CLIENT_SECRET", ""),
            ),
            BRAWLHALLA_API_KEY: Redacted.make(
                SUPPORTED_STAGE_ENV("BRAWLHALLA_API_KEY", ""),
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

        return {
            url: website.url.as<string>(),
            hyperdriveId: Hyperdrive.hyperdriveId,
        }
    }),
)
