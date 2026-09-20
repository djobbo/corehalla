<p align="center">
  <a href="https://corehalla.com">
    <img src="./app/public/images/Corehalla_Logo.gif" height="128">
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

| Package      | Description                                                                                                                         |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `web`        | **TanStack Start app** (Vite + Nitro, React 19, Tailwind v4). The Next.js migration target. See [`web/README.md`](./web/README.md). |
| `app`        | Legacy Next.js app, kept runnable until the `web` cutover is verified.                                                              |
| `worker`     | Discord bot + crawler.                                                                                                              |
| `packages/*` | Shared `server` (tRPC router), `db`, `bhapi`, `web-parser`, `common`, `ui`, `logger` packages.                                      |

## Local development

The local stack is the [Supabase CLI](https://supabase.com/docs/guides/local-development):
`supabase start` brings up Postgres, PostgREST, Auth and Realtime from
`supabase/config.toml`, replacing the hand-maintained Docker Compose + Kong +
database init scripts that used to live in `.devcontainer/`.

```sh
pnpm setup:env     # install deps, `supabase start`, write env files, migrate
pnpm dev           # run the app dev servers
pnpm db:stop       # stop the local stack
```

`pnpm setup:env` is idempotent: it starts the stack (Docker must be running),
writes the returned URL/keys/`DATABASE_URL` into `packages/db/.env`,
`web/.env.local`, `app/.env.local` and `worker/.env` without touching the other
values in those files, then applies the database migrations.

Useful commands:

```sh
pnpm db:start      # supabase start
pnpm db:status     # supabase status (URLs, keys, ports)
pnpm db:stop       # supabase stop
pnpm db:migrate    # drizzle migrate + RLS/realtime/functions setup
```

The service ports come from `supabase/config.toml`: API `54321`, Postgres
`54322`, Studio `54323`.

## Database (Drizzle)

The schema is defined in `packages/db/schema.ts` and owned by
[Drizzle](https://orm.drizzle.team) (the `1.0.0-rc` line). Table names, column
types, defaults and constraint names are identical to the ones Prisma created,
so no data migration is involved.

| Concern      | Where                                                    |
| ------------ | -------------------------------------------------------- |
| Schema       | `packages/db/schema.ts`                                  |
| Migrations   | `packages/db/drizzle/<timestamp>_<name>/`                |
| Supabase SQL | `packages/db/sql/` (RLS, realtime, trigger, RPCs)        |
| Runner       | `packages/db/scripts/db.mts` (Effect + `@effect/sql-pg`) |

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
  `typeCheck: true`, but tsgolint (TypeScript 7) rejects the legacy
  `app`/`worker` tsconfigs (`es5`, `moduleResolution: node10`,
  `downlevelIteration`, `baseUrl`-relative `paths`), and `web` must be checked
  by the Effect-patched compiler. Types are checked per package by
  `pnpm ts:check` instead. Enable both once those tsconfigs are modernized.
- **95 lint warnings** remain (mostly `react/no-unstable-nested-components`,
  `no-underscore-dangle`, `react/function-component-definition` and
  `react/set-state-in-effect`). They are demoted to warnings so the migration
  lands green; fix them and the rules can become errors.
- **Commit hooks are not installed.** `staged` in `vite.config.ts` and
  `.vite-hooks/pre-commit` are committed and ready; run `vp hooks enable` (or
  add `vp config` to a `prepare` script) to activate them, and
  `vp hooks disable` to opt out in a clone.
