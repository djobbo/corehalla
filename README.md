<p align="center">
  <a href="https://corehalla.com">
    <img src="./web/public/images/Corehalla_Logo.gif" height="128">
    <h1 align="center">Corehalla</h1>
  </a>
  <p align="center">
  View official rankings, player and clan stats, or find a community, and join the fight!
  </p>
</p>
<p align="center">
    <a aria-label="Corehalla Website" href="https://corehalla.com" target="_blank">
        <img alt="" src="https://img.shields.io/website.svg?url=http%3A%2F%2Fcorehalla.com&style=for-the-badge&labelColor=202020&label=Corehalla">
    </a>
    <a aria-label="License" href="https://github.com/djobbo/corehalla/blob/master/LICENSE.md" target="_blank">
        <img alt="" src="https://img.shields.io/github/license/djobbo/corehalla.svg?style=for-the-badge&labelColor=202020">
    </a>
    <a aria-label="Corehalla Discord" href="https://discord.com/invite/eD248ez" target="_blank">
        <img alt="" src="https://img.shields.io/badge/Join%20the%20discord-5865F2.svg?style=for-the-badge&logo=Discord&labelColor=202020&logoWidth=20&logoColor=white">
    </a>
    <a aria-label="Corehalla Twitter" href="https://twitter.com/Corehalla" target="_blank">
        <img alt="" src="https://img.shields.io/badge/Follow-1DA1F2.svg?style=for-the-badge&logo=Twitter&labelColor=202020&logoWidth=20&logoColor=white">
    </a>
</p>

## Repository layout

| Package      | Description                                                                                                                        |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `web`        | **TanStack Start app** (Vite, React 19, Tailwind v4). Deployed to Cloudflare with Alchemy. See [`web/README.md`](./web/README.md). |
| `worker`     | Discord bot + crawler.                                                                                                             |
| `packages/*` | Shared `db`, `bhapi`, `web-parser`, `common`, `logger` and `dl-roster-images` packages.                                            |

## Supabase = Postgres only

Supabase is used **only as a Postgres host**. There is no `@supabase/supabase-js`
in the `web` app, the server package or the worker: every query goes through
[Drizzle](https://orm.drizzle.team) on Effect's own PostgreSQL client
(`@effect/sql-pg`), and authentication is owned by the app.

| Concern      | Where                                                                  |
| ------------ | ---------------------------------------------------------------------- |
| Connection   | `DATABASE_URL` (Node/CI) or a Cloudflare Hyperdrive binding (Workers)  |
| Client       | `packages/db/client.ts` (Effect SQL + `drizzle-orm/effect-postgres`)   |
| Node helpers | `packages/db/drizzle.ts` (re-exports the client, schema and operators) |
| Auth         | `web/src/effect/Auth.ts` — app-owned Discord OAuth + DB sessions       |
| Deploy       | `web/alchemy.run.ts` — Cloudflare Worker + Hyperdrive                  |

Removed with the Supabase client: GoTrue auth, PostgREST reads/writes,
`postgres_changes` subscriptions, the `auth.users` foreign key and trigger, all
RLS policies and the `supabase_realtime` publication. Authorization is enforced
in the server layer (every query is scoped to the session's `userId`).

## Local development

Local development still uses the [Supabase CLI](https://supabase.com/docs/guides/local-development)
for Postgres (the same major version as the hosted project), but
`supabase/config.toml` disables Auth, PostgREST, Realtime, Storage and the Edge
runtime — the app owns all of those.

```sh
pnpm setup:env     # install deps, `supabase start`, write DATABASE_URL, migrate
pnpm dev           # run the app dev servers
pnpm db:stop       # stop local Postgres
```

`pnpm setup:env` is idempotent: it starts Postgres (Docker must be running),
writes `DATABASE_URL` into `packages/db/.env`, `web/.env.local` and
`worker/.env` without touching the other values in those files, then applies the
database migrations.

Useful commands:

```sh
pnpm db:start      # supabase start (Postgres + Studio)
pnpm db:status     # supabase status
pnpm db:stop       # supabase stop
pnpm db:migrate    # drizzle migrate + the SQL in packages/db/sql/
```

The app and the worker read the same `DATABASE_URL`; `web` resolves it through
`web/src/env.ts`, which prefers `process.env` on Node and the Hyperdrive
binding on Cloudflare.

## Database (Drizzle)

The schema is defined in `packages/db/schema.ts` and owned by
[Drizzle](https://orm.drizzle.team) (the `1.0.0-rc` line). Table names, column
types, defaults and constraint names are identical to the ones Prisma created,
so no data migration is involved.

| Concern    | Where                                                    |
| ---------- | -------------------------------------------------------- |
| Schema     | `packages/db/schema.ts`                                  |
| Migrations | `packages/db/drizzle/<timestamp>_<name>/`                |
| Setup SQL  | `packages/db/sql/` (extensions, RPCs, Supabase cleanup)  |
| Runner     | `packages/db/scripts/db.mts` (Effect + `@effect/sql-pg`) |

```sh
pnpm --filter db db:generate   # drizzle-kit generate: migration from schema.ts
pnpm --filter db db:migrate    # apply migrations, then the sql/ files
pnpm --filter db db:setup      # only re-run the sql/ files
pnpm --filter db db:push       # drizzle-kit push (dev only)
pnpm --filter db db:studio     # drizzle-kit studio
```

`schema.ts` is the only place the row types come from: `BHPlayerData`,
`UserProfile`, … are inferred from the tables with `$inferSelect`, so adding a
table is a schema change plus a `db:generate`, with no code generation step.

**Existing databases** (anything created by the Prisma migrations, including
production) already contain this schema and have no Drizzle migration journal.
Adopt them once with:

```sh
pnpm --filter db db:init       # record the baseline as applied, run nothing
```

Migration `20260920200153_wet_aqueduct` adds `UserSession` plus the
`UserProfile.discordId`/`email`/`createdAt` columns. `db:migrate` runs
`legacy_supabase_auth_cleanup.sql` first (dropping the `auth.users` foreign key
and trigger, the RLS policies and the realtime publication — idempotent no-ops
on a plain Postgres) and `backfill_discord_ids.sql` afterwards, which copies the
Discord snowflake out of `auth.identities` so existing users are recognised on
their next sign-in.

## Authentication

`web` implements Discord sign-in itself:

| Route                            | Purpose                                                   |
| -------------------------------- | --------------------------------------------------------- |
| `GET /api/auth/discord`          | Mints the OAuth `state` cookie and redirects to Discord   |
| `GET /api/auth/discord/callback` | Exchanges the code, upserts the profile, sets the session |
| `POST /api/auth/signout`         | Deletes the session row and clears the cookie             |
| `GET /api/me/session`            | The signed-in `UserProfile`, or `{ user: null }`          |
| `/api/me/favorites`              | `GET`/`POST`/`DELETE` the user's favourites               |
| `/api/me/connections`            | `GET` stored Discord connections, `POST` re-syncs them    |

The browser holds one opaque HttpOnly, `SameSite=Lax` cookie. Only its SHA-256
digest is stored (`UserSession.id`), and the Discord access/refresh tokens stay
in that row — refreshed server-side shortly before they expire. Set
`DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET` in `web/.env` and register
`${SITE_URL}/api/auth/discord/callback` as the redirect URL.

## Deployment (Alchemy → Cloudflare)

`web` deploys to Cloudflare Workers with [Alchemy](https://alchemy.run):

```sh
pnpm --filter web deploy      # alchemy deploy
pnpm --filter web dev:cloud   # alchemy dev (Workers runtime + local Postgres)
pnpm --filter web destroy     # alchemy destroy
```

`web/alchemy.run.ts` builds `Cloudflare.Website.Vite` (Alchemy supplies the
Cloudflare Vite plugin, so `vite.config.ts` has no Nitro/Cloudflare preset) and
a `Cloudflare.Hyperdrive.Connection` over the Supabase Postgres origin. The
Worker reads the pooled connection string from the `HYPERDRIVE` binding; the
deploy reads `SUPABASE_DB_*`, `DISCORD_*`, `BRAWLHALLA_API_KEY` and `SITE_URL`
from its environment. Caching is disabled on the Hyperdrive because sessions
must never be read stale.

Drizzle's migrator reads the `drizzle/` directory from disk, which a Worker
cannot do, so migrations stay a Node/CI step (`pnpm db:migrate`, pointed at the
same origin). `worker` is not deployed by this stack.

## Tooling

The workspace is built and checked with [Vite+](https://viteplus.dev), which
replaces the previous Turborepo + ESLint + Prettier setup with a single
toolchain:

| Concern     | Before                        | Now                                                  |
| ----------- | ----------------------------- | ---------------------------------------------------- |
| Task runner | Turborepo (`turbo.json`)      | Vite Task (`vp run`, configured in `vite.config.ts`) |
| Linting     | ESLint (`.eslintrc.yml`)      | Oxlint (`vp lint`, `lint` block)                     |
| Formatting  | Prettier (`.prettierrc`)      | Oxfmt (`vp fmt`, `fmt` block)                        |
| Checks      | separate `lint`/`format` runs | `vp check` (format + lint in one pass)               |
| Git hooks   | —                             | `vp staged` (opt in with `vp hooks enable`)          |

All lint, format and task configuration lives in the root `vite.config.ts`.

```sh
pnpm ci:install    # vp install --frozen-lockfile
pnpm dev           # vp run -r --parallel dev (all packages)
vp dev             # built-in dev server for ./web (see defaultPackage)
pnpm build         # vp run -r build
pnpm check         # vp check — format + lint the whole workspace
pnpm lint          # vp lint --fix
pnpm ts:check      # vp run -r ts:check (per-package, incl. @effect/tsgo)
pnpm ci:lint       # vp lint (no fixes; used in CI)
```

### Notes and follow-ups

- **Type-aware linting is off.** Vite+ recommends `typeAware: true` +
  `typeCheck: true`, but tsgolint (TypeScript 7) still rejects the legacy
  `tsconfig/nextjs` base the Node packages extend (`es5`,
  `downlevelIteration`), and `web` must be checked by the Effect-patched
  compiler. Types are checked per package by `pnpm ts:check` instead. (`worker`
  now resolves Effect's ESM-only `exports` via `moduleResolution: "bundler"`.)
- **61 lint warnings** remain (mostly `react/no-unstable-nested-components`,
  `no-underscore-dangle`, `react/function-component-definition` and
  `react/set-state-in-effect`). They are demoted to warnings so the migration
  lands green; fix them and the rules can become errors.
- **Commit hooks are not installed.** `staged` in `vite.config.ts` and
  `.vite-hooks/pre-commit` are committed and ready; run `vp hooks enable` (or
  add `vp config` to a `prepare` script) to activate them, and
  `vp hooks disable` to opt out in a clone.
