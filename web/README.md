# web — Corehalla on TanStack Start + Effect

This package is the TanStack Start app that replaced the legacy Next.js app.
The legacy `app/`, the `server` tRPC package and `packages/db/supabase/` have
been removed.

- **Bundler:** [Vite+](https://viteplus.dev) (Vite 8) — lint, format, tasks and
  the bundler come from one toolchain
- **Framework:** TanStack Start + TanStack Router (file-based routes)
- **Runtime/data:** [Effect v4](https://effect.website) — `HttpApi` + `HttpClient`
  on the server, `Atom` + `@effect/atom-react` on the client
- **Deployment:** Cloudflare Workers via [Alchemy](https://alchemy.run) (`Cloudflare.Website.Vite` + `Cloudflare.D1.Database`); the stack lives at the repo root (`../alchemy.run.ts`)
- **UI:** React 19, Tailwind CSS v4 (CSS-first config), Stitches, Radix, kbar
- **TypeScript:** 7.0.2 (native) with `@effect/tsgo`

## Commands

Vite+ is configured at the workspace root (`vite.config.ts`); `defaultPackage`
points `vp dev`/`vp build`/`vp preview` at this package, so the root-level
commands work without a filter.

```sh
vp -C web dev          # dev server on http://localhost:3000
vp -C web build        # production build (+ route tree generation)
vp -C web preview      # preview the built output
vp -C web ts:check     # effect-tsgo patch && tsc --noEmit
pnpm dev:cloud                # (root) alchemy dev: Workers runtime + local D1 simulator
pnpm deploy                   # (root) alchemy deploy: Cloudflare Worker + assets
```

From the repository root:

```sh
vp dev                 # built-in dev server for ./web (defaultPackage)
vp build               # built-in build for ./web
vp check               # oxfmt + oxlint over the whole workspace
vp run -r ts:check     # type-check every package
```

> Server code reads configuration through `src/env.ts`, which prefers
> `process.env` on Node and the Worker bindings (D1, secrets) on
> Cloudflare.

## Architecture

```
src/
  router.tsx              # createRouter(routeTree) + per-request Atom registry
  start.ts                # CSRF middleware for server functions
  server.ts               # custom server entry: injects Stitches CSS into SSR <head>
  effect/
    Api.ts                # HttpApi contract (groups + endpoints + schemas)
    schemas.ts            # request/response schemas
    Brawlhalla.ts         # HttpClient-based Brawlhalla service
    Database.ts           # Drizzle + Effect SQL stats queries
    Auth.ts               # app-owned Discord OAuth sessions
    config.ts             # runtime configuration (Node env / Worker bindings)
    cookies.ts            # cookie + opaque session-token primitives
    discord.ts            # Discord OAuth2 + REST calls
    http.ts               # same-origin guard and private-JSON helpers
    run.ts                # per-request service runner for server routes
    Content.ts            # web-parser service
    Handlers.ts           # HttpApiBuilder group implementations
    Server.ts             # build -> WHATWG fetch handler for /api/effect/*
    Client.ts             # AtomHttpApi client (browser fetch / SSR loopback)
    atoms.ts              # query atom factories + SSR preload/dehydrate helpers
    retry.ts              # exponential-backoff retry policy
    errors.ts             # typed domain errors
  routes/                 # file-based routes + server routes
  components/ hooks/ providers/ util/   # migrated from the legacy Next.js app
  ui/                     # vendored UI primitives (React 19 + Start link/router)
  lib/                    # vendored client hooks, analytics, date
  styles/app.css          # Tailwind v4 entry + design tokens
```

### Data layer: Effect replaces tRPC and React Query

The typed API is declared once as an `HttpApi` contract
(`src/effect/Api.ts`) and mounted as a TanStack Start server route at
`/api/effect/$`:

- **Server** — `HttpApiBuilder.group(...)` implements each endpoint with the
  `Brawlhalla`, `Database`, and `Content` services. Services are resolved in the
  _outer_ group builder, so the handler layer only requires plain services and
  `Layer.provide` can discharge them.
- **Outbound HTTP** — the Brawlhalla service calls upstream through Effect's
  `HttpClient`, preferring the dair.gg proxy and falling back to the official
  API.
- **Client** — `AtomHttpApi.Service()` generates typed query atoms from the same
  contract. Components read them with `useAtomValue` / `useQuery`
  (`useAtomSuspense`), so there is no hand-written fetch layer on the client.

React Query has been removed. Retries now use Effect's native
`Schedule.exponential("200 millis")` (200ms → 400ms → 800ms → 1.6s, 4 attempts)
through `src/effect/retry.ts`, applied to every request the client and the
Brawlhalla service make.

### Server-only boundaries

Privileged code is only reachable from server routes:

- `Brawlhalla` / `Database` / `Content` / `Auth` import server-only modules
  (`db/client`, `web-parser`, `effect/discord`) and are only imported by
  `Handlers.ts`, `Server.ts` and the `api/auth` + `api/me` server routes.
- Queries go straight to Cloudflare D1 through `packages/db/client.ts`
  (`@effect/sql-d1` + `drizzle-orm/effect-d1`); the query operators come from
  `db/query` so `web` shares `db`'s single `drizzle-orm` instance.
- Verified: the client bundle contains no `cheerio`, database driver,
  `HttpApiBuilder`, tRPC, or React Query code.

### Authentication

Supabase Auth is gone. `src/effect/Auth.ts` owns sessions:

- `GET /api/auth/discord` sets a single-use `state` cookie and redirects to
  Discord; `GET /api/auth/discord/callback` exchanges the code, upserts
  `UserProfile` (keyed by the Discord snowflake) and sets the session cookie.
- The cookie holds an opaque random token; only its SHA-256 digest is stored in
  `UserSession`, together with the Discord access/refresh tokens. The browser
  never receives them.
- `Auth.getSession(headers)` refreshes the Discord token shortly before it
  expires and scopes every favourites/connections read and write to the
  session's `userId`, which is what replaced RLS.
- `/api/me/*` server routes expose session, favourites and connections to the
  React providers in `src/providers/auth/`; live updates come from optimistic
  local state instead of `postgres_changes`.

### SSR with Effect atoms

Route loaders preload their query atoms into the registry that `getRouter()`
creates per server request, then return the dehydrated state:

```ts
loader: ({ params, context }) =>
    loadAtoms(context, [rankings1v1Atom(region, page, name)])
```

`Hydration.dehydrate` runs after the atoms settle and the root route feeds every
matched route's slice into `HydrationBoundary`, so the first client render uses
the server-computed values and does not refetch. Each query atom passes a
`serializationKey` (required for dehydration) and a `timeToLive` so its node
survives until dehydrate.

During SSR the atom client targets the deployment's own origin
(`INTERNAL_ORIGIN`, else `SITE_URL`, else the build-time `VITE_SITE_URL`, else
`http://localhost:$PORT`), because `fetch` cannot resolve a relative URL on the
server.

### SSR mode per route

| Route                     | `ssr`                                           | Why                                         |
| ------------------------- | ----------------------------------------------- | ------------------------------------------- |
| `/`                       | `true`                                          | Landing content has SEO value               |
| `/rankings/1v1/…`         | `true`, or `'data-only'` when `?player=` is set | Search results are non-canonical            |
| `/rankings/2v2/…`         | `true`                                          | Public, indexable                           |
| `/rankings/clans/…`       | `true`, or `'data-only'` when `?clan=` is set   | Same as 1v1                                 |
| `/rankings/global/…`      | `true`                                          | Public, indexable                           |
| `/rankings/power/…`       | `true`                                          | Public, indexable                           |
| `/stats/player/$playerId` | `true`                                          | Public, indexable; 404 for a missing player |
| `/stats/clan/$clanId`     | `true`                                          | Public, indexable                           |
| `/calc`                   | `true`                                          | Static tool, indexable                      |
| `/@me/favorites`          | `false`                                         | Content comes from the app session cookie   |

`/@me/favorites` also returns `Cache-Control: private, no-store` and
`robots: noindex`.

### Search params

Validated with zod and kept in the URL:

- `/rankings/1v1/…?player=` — validated, part of `loaderDeps`
- `/rankings/clans/…?clan=` — validated, part of `loaderDeps`
- `/rankings/global/…?sortBy=` — validated, part of `loaderDeps`
- `/rankings/power/…?q=` — validated, client-side filter

`stripSearchParams` keeps default values out of the canonical URL so the server
does not redirect `/rankings/1v1` to `/rankings/1v1?player=`.

### Routes and redirects

- Optional path params (`/rankings/1v1/{-$region}/{-$page}`) replace the
  Next.js optional catch-alls.
- Every legacy redirect is preserved as an HTTP 308 route.
- `/sitemap.xml` and `/robots.txt` are dynamic server routes driven by
  `SITE_URL`.
- The previous hand-written `/api/*` REST routes are retained unchanged;
  the Effect API lives under `/api/effect/*`.

## TypeScript 7 + `@effect/tsgo`

Effect's diagnostics need the patched compiler:

- `typescript` is pinned to exactly `7.0.2` (the native compiler) because
  `@effect/tsgo` only supports specific upstream versions.
- `web/package.json` runs `effect-tsgo patch` from `prepare` and from
  `ts:check`.
- `tsconfig.json` needs `"types": ["node", "vite/client"]` (TS 7 no longer
  auto-includes `@types/*`), relative `paths` (TS 7 removed `baseUrl`), and the
  `@effect/language-service` plugin entry.

## Environment variables

See `.env.example`. Server-only variables are read through `src/env.ts`, which
prefers `process.env` on Node and the Worker bindings on Cloudflare; browser
variables are read through `import.meta.env` (Vite `envPrefix` allows both
`VITE_` and the legacy `NEXT_PUBLIC_` prefix). There is no database URL: the
database is the `DB` D1 binding.

| Variable                | Purpose                                              |
| ----------------------- | ---------------------------------------------------- |
| `DISCORD_CLIENT_ID`     | Discord OAuth application id                         |
| `DISCORD_CLIENT_SECRET` | Discord OAuth application secret                     |
| `SITE_URL`              | Public origin; also the OAuth redirect base          |
| `BRAWLHALLA_API_KEY`    | Brawlhalla API key (server only)                     |
| `INTERNAL_ORIGIN`       | Optional override for the SSR atom self-fetch origin |

Alchemy reads its own credentials from the repo-root `.env` (or from an
`alchemy profile`): `CLOUDFLARE_ACCOUNT_ID` plus `CLOUDFLARE_API_TOKEN` (or
`CLOUDFLARE_API_KEY` + `CLOUDFLARE_EMAIL`). The token needs Workers Scripts:
Edit, D1: Edit and Secrets Store: Edit; see the root README for the full list and
the `alchemy profile edit` OAuth alternative.

## Deployment (Cloudflare via Alchemy)

The root `alchemy.run.ts` declares the deployment:

- `Cloudflare.D1.Database("CorehallaDb", { name: "corehalla", migrations })`
  creates the SQLite database and applies `packages/db/drizzle` at deploy (and to
  the local simulator under `alchemy dev`). Read replication is left off so
  sessions are never read stale.
- `Cloudflare.Website.Vite` builds the Vite `ssr` environment into a Worker plus
  static assets, binding the database as `DB` (`src/env.ts` reads `env.DB`).
  Alchemy supplies the Cloudflare plugin, so `vite.config.ts` must not add
  `@cloudflare/vite-plugin` or Nitro.
- Secrets (`DISCORD_CLIENT_SECRET`, `BRAWLHALLA_API_KEY`) are bound as
  `secret_text`; `SITE_URL`/`VITE_SITE_URL`/`INTERNAL_ORIGIN` are plain values.

Seeding is a one-off manual step; see the root README. `pnpm db:seed` generates
the synthetic data, `pnpm db:import:supabase` converts the old Supabase database
into D1-ready SQL, and `pnpm db:seed:verify` checks either result offline against
`node:sqlite`.

### Dev modes

- `pnpm dev:cloud` (`alchemy dev`, run from the repo root) runs the app in
  workerd with the real bindings — the Vite dev server with HMR behind a stable
  local URL, the local D1 simulator under `.alchemy/local/d1` at the repo root,
  and migrations applied — so it is the only mode where DB-backed routes work.
  Local imports come from the D1 resource's `importFiles`; `wrangler d1 execute
--local` cannot see this simulator because it has its own Miniflare store.
  State uses `Cloudflare.state()`, which needs Cloudflare credentials.
- `pnpm --filter web dev` is plain Vite on `:3000` with no bindings: `env.DB` is
  undefined and DB-backed routes throw. Use it for UI-only work.
- Alchemy's `importFiles` is for small reference data; the old-database migration
  uses the split `.sql` files from `import-postgres.mts`.

## Migration status

The Next.js cutover is complete: `app/`, the `server` tRPC package and
`packages/db/supabase/` have been removed, and the database moved from
Postgres/Supabase to Cloudflare D1 (see `packages/db/schema.ts`). The worker's
crawler owns its `updateDBPlayerData` mutation
(`worker/src/crawler/updateDBPlayerData.ts`) and reaches D1 over the HTTP API.
