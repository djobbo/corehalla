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
| `worker`     | Discord bot + crawler (long-running Node process).                                                                                 |
| `packages/*` | Shared `db`, `bhapi`, `web-parser`, `common`, `logger` and `dl-roster-images` packages.                                            |

## Data layer: Cloudflare D1 (SQLite)

The database is a single **Cloudflare D1** SQLite database, reached with
[Drizzle](https://orm.drizzle.team) on Effect's SQL client:

| Concern        | Where                                                            |
| -------------- | ---------------------------------------------------------------- |
| Schema         | `packages/db/schema.ts` (`sqliteTable`)                          |
| Migrations     | `packages/db/drizzle/<timestamp>_<name>/`                        |
| Worker client  | `packages/db/client.ts` — `@effect/sql-d1` on the `DB` binding   |
| Node client    | `packages/db/node.ts` — D1 HTTP API behind the same Effect stack |
| Query surface  | `packages/db/query.ts` — re-exports `drizzle-orm` + the schema   |
| Seed generator | `packages/db/scripts/seed.mts`                                   |
| Import tool    | `packages/db/scripts/import-postgres.mts` (old Supabase → D1)    |

Column mapping from the old Postgres database: `uuid -> text` (ids default to
`crypto.randomUUID()`), `timestamp -> integer` (`timestamp_ms`), `jsonb -> text`
(`json` mode), `boolean -> integer` (`boolean` mode). Sessions, favourites and
connections stay app-owned; every write is scoped to the session's `userId` in
`web/src/effect/Auth.ts`.

### Indexes

`packages/db/schema.ts` indexes the hot read paths:

- `BHPlayerData` — one index per global-ranking sort column (`xp`, `games`,
  `wins`, …, `damageGadgets`) plus `lastUpdated` for the crawler's flush pass.
  The `ORDER BY` column is dynamic, so each sortable column needs its own index;
  without one every ranking page is a full scan (and D1 bills rows read).
- `BHPlayerAlias` — a `COLLATE NOCASE` index on `alias` for the prefix search,
  plus `createdAt`.
- `BHClan` — a `COLLATE NOCASE` index on `name` for the prefix search, plus `xp`.

SQLite has no `ILIKE`, so text search is a plain `LIKE 'x%'` against those
NOCASE indexes — a `lower(col)` expression index would not be used by `LIKE`.
Indexes add one written row per indexed column on every write — keep the
crawler's write volume in mind when adding more.

### Migrations

```sh
pnpm db:generate   # drizzle-kit generate (dialect: sqlite)
```

Migrations are applied by **Alchemy** at deploy — the root `alchemy.run.ts` declares
`Cloudflare.D1.Database("CorehallaDb", { name: "corehalla", migrations:
"../packages/db/drizzle" })` — and to the local simulator by `alchemy dev`. There
is no Node migrator any more.

## Seeding

Seeding is a **one-off, manual** operation: nothing seeds automatically.
`packages/db/scripts/seed.mts` is a checked-in, deterministic generator that
writes chunked, FK-ordered `INSERT`s (one statement per line, grouped under D1's
100 KB per-statement limit). Its output is gitignored.

`wrangler` is intentionally not a dependency of this repo; run it with `pnpm dlx`
for the import step.

```sh
# 1. Generate (default 1,000,000 players); output is gitignored.
pnpm db:seed -- --rows=1000000

# 2. Validate offline — in-memory SQLite, no D1, no billing.
pnpm db:seed:verify

# 3. Import once (needs CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN).
pnpm dlx wrangler d1 execute corehalla --remote --file=packages/db/seed/generated/seed.sql --yes

# 4. Verify size and counts.
pnpm dlx wrangler d1 info corehalla
pnpm dlx wrangler d1 execute corehalla --remote --command 'select count(*) from "BHPlayerData"'
```

`db:seed:verify` applies every migration and a small seed to an in-memory
`node:sqlite` database, checks the row counts and foreign keys, and asserts the
ranking / alias / clan queries use their indexes via `EXPLAIN QUERY PLAN`. The
same command replays a generated import directory with `--dir=…` (see below), or
a disk-backed database with `--db=/tmp/corehalla-verify.sqlite` for a full-size
dump.

`seed.mts` flags: `--rows`, `--chunk`, `--seed`, `--timestamp`, `--out`. The same
`--seed` always produces the same data. `lastUpdated`/`createdAt` default to the
current time so the crawler's "delete rows older than two days" pass does not
immediately drop the seed.

> **Cost:** D1 bills rows written (and rows read). The indexes above are created
> by the migration, so a large initial import pays for their writes too. For a
> very large seed you can drop the secondary indexes, import, then recreate them
> — the DDL is in the generated migration.

## Importing the old Supabase data

Postgres SQL is not importable into D1 as-is (types and syntax differ), so
`packages/db/scripts/import-postgres.mts` reads the old Supabase database over a
**read-only** connection, converts every row to SQLite literals and writes a
numbered series of D1-ready `.sql` files:

```
Postgres (read-only)
      │  import-postgres.mts — keyset pagination, never OFFSET
      ▼
packages/db/seed/generated/supabase/0001.sql, 0002.sql, …   (gitignored, ≤200 MB each)
      │  pnpm db:seed:verify --dir=…              (offline check)
      ▼
Cloudflare D1   ←  wrangler d1 execute --remote --file=…      (one-off import)
```

```sh
# Use the session pooler connection string; the direct db.<ref> host is IPv6-only.
pnpm db:import:supabase -- \
  --source="postgres://postgres.<ref>:<pw>@aws-0-<region>.pooler.supabase.com:5432/postgres?sslmode=require"

# Validate the generated files against the real schema, offline and free.
pnpm db:seed:verify -- --dir=packages/db/seed/generated/supabase

# Import once, file by file (a single D1 import is capped at 5 GiB).
for f in packages/db/seed/generated/supabase/*.sql; do
  pnpm dlx wrangler d1 execute corehalla --remote --file="$f" --yes
done

pnpm dlx wrangler d1 info corehalla
```

The generator copies, in foreign-key order: `UserProfile`, `UserFavorite`,
`UserConnection`, `BHClan`, `BHPlayerData`, `BHPlayerLegend`, `BHPlayerWeapon`,
`BHPlayerAlias`, `CrawlProgress`.

- **`UserProfile.id` is preserved**, and `discordId`, `email` and `createdAt` are
  backfilled from `auth.users` / `auth.identities`. That is what makes the next
  Discord sign-in resolve to the existing profile instead of creating a duplicate
  and orphaning the user's favourites.
- **`UserSession` is not copied.** Sessions hold this app's opaque token hashes;
  they do not survive the move and users simply sign in again.
- Naive Postgres timestamps are converted with `AT TIME ZONE 'UTC'` inside
  Postgres, so the result does not depend on the timezone of the machine running
  the import.

Flags: `--source` (or `SOURCE_DATABASE_URL`), `--out`, `--chunk`,
`--max-bytes` (rotate at N bytes per file), `--max-statement-bytes`,
`--only=Table,Table`, `--limit=N` (rows per table — good for a dry run), and
`--ssl=auto|require|verify|disable` (`auto` follows the URL's `sslmode`, and
defaults to TLS for remote hosts, off for localhost).

**Connection-string gotchas.** The URL is parsed by hand, so a password
containing `#`, `@`, `?`, `/` or `:` works as pasted — you do not have to
percent-encode it (an encoded `p%40ss%23word` also decodes). What still fails
loudly, with a specific message, is:

- an unreplaced placeholder — `[YOUR-PASSWORD]`, or `[region]`/`[project-ref]`
  left in the host (paste the real values from Supabase → Connect → **Session
  pooler**);
- the Supabase **API** URL (`https://<ref>.supabase.co`) instead of the
  `postgres://` connection string;
- passing an unquoted URL to a shell: `#` starts a comment and `[`/`]` glob, so
  quote it (`--source="postgres://…"`) or put it in `packages/db/.env`.

Also note the direct host `db.<ref>.supabase.co` is IPv6-only and the
transaction pooler on port `6543` has no session state — the script warns about
both and the session pooler on `5432` is the right choice.

Once the data is in and verified, `import-postgres.mts` (and the generated
directory) are dead weight: nothing at deploy or runtime references them, so
delete them.

### Importing with Alchemy's `importFiles`

Alchemy's `importFiles` is the _same_ Cloudflare bulk-import path as
`wrangler d1 execute --file`: it uploads the SQL and lets D1 ingest it (the
database is locked for the duration), executes it against the **existing**
database — it does not wipe it — and hash-tracks each file so a redeploy skips
what it already applied. `alchemy dev` runs the same files against the local
simulator.

The root `alchemy.run.ts` attaches the generated directory when the opt-in flag is
set, so the whole import is one command:

```sh
IMPORT_SUPABASE_SEED=1 pnpm deploy
```

- The flag exists because the files are large and gitignored: as an
  unconditional prop, a deploy that lacks them (CI) would fail while reading
  them. Without the flag the prop is `undefined`, and dropping the prop later
  only clears the recorded hashes — it never deletes imported rows.
- Files are applied **in sorted order**, so `0001.sql` (users, favourites,
  connections, clans, players) lands before `0002.sql`.
- The flag also affects `alchemy dev`: with it set, the next reconcile replays
  the files into the local simulator too.
- Removing the flag and deploying again is enough to retire the import; the
  generator and its output can then be deleted.
- Per-file limit is 5 GiB; memory is the practical bound, because Alchemy reads
  each file into a string to hash and upload it. `--max-bytes` on the generator
  controls the split if you want smaller imports (for example
  `--max-bytes=50000000` for ~50 MB files) — useful because D1 is locked while
  each file ingests.

The `wrangler` loop above remains the alternative when you would rather not
touch the stack, or want to watch each file complete on its own.

## Local development

`web` needs the D1 `DB` binding, which only exists inside a Worker runtime, so
there are two modes:

| Command                 | What you get                                                                                                                                                                                                                 |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm dev:cloud`        | `alchemy dev` — the real Worker runtime with the Vite dev server (HMR) behind a stable local URL, the **local D1 simulator**, migrations applied, and `importFiles` executed. Use this when the change touches the database. |
| `pnpm --filter web dev` | Plain Vite on `:3000`. Fast, but **no bindings**: `env.DB` is undefined and DB-backed routes throw. Use it for pure UI work.                                                                                                 |

How `alchemy dev` behaves:

- **Bindings are real.** `Cloudflare.Website.Vite` runs the app in workerd with
  the same `env` as production; `web/src/env.ts` reads `env.DB`.
- **Local database.** D1 is emulated in workerd and persists under
  `.alchemy/local/d1` at the repo root (gitignored). Migrations from
  `packages/db/drizzle` are applied on every reconcile, exactly as at deploy.
- **Seeding it.** That simulator is _not_ wrangler's Miniflare store, so
  `wrangler d1 execute --local` does not see it. Point `importFiles` at the
  generated `.sql` files instead (Alchemy runs imports locally, skipping files
  whose hash it already applied), or use `Cloudflare.D1.QueryDatabase` inside an
  `Action`.
- **Secrets.** The stack reads `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`,
  `BRAWLHALLA_API_KEY` and `SITE_URL` from `process.env`, so export them (or
  start the CLI through Node with `--env-file`, see below). It warns when a
  required one is missing instead of binding an empty secret silently.
- **State.** The stack uses `Cloudflare.state()` — a state-store Worker in your
  account — so `alchemy dev` needs `CLOUDFLARE_API_TOKEN` / account credentials.
  Swap in `Alchemy.localState()` for a purely local, file-backed state.

```sh
pnpm dev:cloud   # alchemy dev — Worker runtime + local D1 simulator
pnpm deploy      # alchemy deploy
pnpm destroy     # alchemy destroy
```

The `worker` (crawler + Discord bot) is a Node process; it talks to the same D1
database over the HTTP API, configured with `CLOUDFLARE_ACCOUNT_ID`,
`CLOUDFLARE_D1_DATABASE_ID` and `CLOUDFLARE_API_TOKEN` in `worker/.env`.

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
`DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET` (in `web/.env` for `vp dev`,
and exported or loaded with `--env-file` for a deploy) and register
`${SITE_URL}/api/auth/discord/callback` as the redirect URL.

## Deployment (Alchemy → Cloudflare)

The root `alchemy.run.ts` declares the whole deployment:

- `Cloudflare.D1.Database("CorehallaDb", { name: "corehalla", migrations })` —
  the SQLite database, with the Drizzle migrations applied at deploy. Read
  replication is left off because sessions are read on every authenticated
  request and a lagging replica would serve stale sessions.
- `Cloudflare.Website.Vite` — the TanStack Start Worker plus static assets,
  with `DB: CorehallaDb` and the Discord/Brawlhalla secrets bound in `env`.

```sh
pnpm deploy      # loads .env + web/.env, then applies migrations and deploys
```

The secrets it binds are read from `web/.env` (see below); a bare
`alchemy deploy` needs them exported instead.

### Cloudflare credentials

`pnpm dev:cloud` / `pnpm deploy` need Cloudflare credentials. Alchemy selects a
**profile** (`--profile` flag → `ALCHEMY_PROFILE` → `default`) and only falls
back to environment variables when the required ones are present:

```sh
pnpm exec alchemy provider check-env   # variables missing, per provider
pnpm exec alchemy profile current      # which profile is selected
```

**Use an existing profile.** The gitignored root `.env` sets

```sh
ALCHEMY_PROFILE=corehalla
```

so the credentials stored in that profile are used by `pnpm dev:cloud` /
`pnpm deploy` (per command: `ALCHEMY_PROFILE=corehalla pnpm dev:cloud`, or
`pnpm exec alchemy dev --profile corehalla`).

**Create or reconfigure a profile** (OAuth recommended — nothing secret in a
file, token refreshes itself):

```sh
pnpm exec alchemy profile edit --profile corehalla --add Cloudflare
```

**Environment (CI):** `CLOUDFLARE_ACCOUNT_ID` plus either `CLOUDFLARE_API_TOKEN`,
or `CLOUDFLARE_API_KEY` with `CLOUDFLARE_EMAIL`, in a **repo-root `.env`**. The
`pnpm dev:cloud` / `pnpm deploy` / `pnpm destroy` scripts load `.env` and
`web/.env` into the process (`node --env-file-if-exists …`), so the app secrets
live in `web/.env` — the same file `vp dev` reads:

```sh
# .env                    (gitignored)  — Alchemy itself
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_API_TOKEN=...

# web/.env                (gitignored)  — the app
DISCORD_CLIENT_ID=...
DISCORD_CLIENT_SECRET=...
BRAWLHALLA_API_KEY=...
SITE_URL=https://corehalla.com
```

Environment credentials take precedence over a profile, so a stale `.env` will
mask an OAuth login. A bare `alchemy deploy` (bypassing the scripts) sees only
the real process environment — export the values, or use the profile.

For an account-scoped API token, start from Cloudflare's **Edit Cloudflare
Workers** template and add:

| Permission             | Needed for                                                          |
| ---------------------- | ------------------------------------------------------------------- |
| Workers Scripts: Edit  | deploying the app Worker, its assets and secrets                    |
| D1: Edit               | creating the database, applying migrations, the bulk import         |
| Secrets Store: Edit    | Alchemy's state store (`alchemy-state-store`) keeps its token there |
| Account Settings: Read | resolving the account's `workers.dev` subdomain                     |
| Memberships: Read      | only when `CLOUDFLARE_ACCOUNT_ID` is unset (account discovery)      |

`pnpm exec alchemy cloudflare token` can mint such a token from a Global API Key.

Not required unless you add them: KV/R2/Queues, Workers Routes + Zone (custom
domains), Workers Observability (only when `observability` is set in the stack).

The `worker` crawler and the `wrangler` fallback need less: `CLOUDFLARE_ACCOUNT_ID`
and a `CLOUDFLARE_API_TOKEN` with **D1: Edit** (wrangler also accepts
`wrangler login`).

## Tooling

The workspace is built and checked with [Vite+](https://viteplus.dev), which
replaces the previous Turborepo + ESLint + Prettier setup with a single
toolchain: Vite Task (`vp run`) for tasks, Oxlint for linting and Oxfmt for
formatting. All configuration lives in the root `vite.config.ts`.

```sh
pnpm ci:install    # vp install --frozen-lockfile
pnpm dev           # vp run -r --parallel dev (all packages)
pnpm build         # vp run -r build
pnpm check         # vp check — format + lint the whole workspace
pnpm lint          # vp lint --fix
pnpm ts:check      # vp run -r ts:check (per-package, incl. @effect/tsgo)
pnpm ci:lint       # vp lint (no fixes; used in CI)
```

### Notes and follow-ups

- **Type-aware linting is off.** Vite+ recommends `typeAware: true` +
  `typeCheck: true`, but tsgolint (TypeScript 7) still rejects the legacy
  `worker` tsconfig (`es5`, `downlevelIteration`, `baseUrl`-relative `paths`),
  and `web` must be checked by the Effect-patched compiler. Types are checked per
  package by `pnpm ts:check`.
- **Lint warnings** are demoted so the migration lands green; fix them and the
  rules can become errors.
- **`worker` is React 18** (`react-reconciler` / `reaccord`); its tsconfig pins
  `react` types to its own copy so the React 19 types hoisted for `web` do not
  leak into its JSX namespace.
- **Commit hooks are not installed.** `staged` in `vite.config.ts` and
  `.vite-hooks/pre-commit` are committed and ready; run `vp hooks enable` to
  activate them.
