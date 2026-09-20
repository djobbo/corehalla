# web — Corehalla on TanStack Start + Effect

This package is the TanStack Start migration of the Next.js app in `app/`. Both
apps run side by side until the cutover is complete.

- **Bundler:** [Vite+](https://viteplus.dev) (Vite 8) — lint, format, tasks and
  the bundler come from one toolchain
- **Framework:** TanStack Start + TanStack Router (file-based routes)
- **Runtime/data:** [Effect v4](https://effect.website) — `HttpApi` + `HttpClient`
  on the server, `Atom` + `@effect/atom-react` on the client
- **Deployment:** Nitro (`node-server` locally, the `vercel` preset on Vercel)
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
```

From the repository root:

```sh
vp dev                 # built-in dev server for ./web (defaultPackage)
vp build               # built-in build for ./web
vp check               # oxfmt + oxlint over the whole workspace
vp run -r ts:check     # type-check every package
```

> The production server reads configuration from the runtime environment.
> For local production previews run
> `node --env-file=.env .output/server/index.mjs`.

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
    Database.ts           # Supabase service
    Content.ts            # web-parser service
    Handlers.ts           # HttpApiBuilder group implementations
    Server.ts             # build -> WHATWG fetch handler for /api/effect/*
    Client.ts             # AtomHttpApi client (browser fetch / SSR loopback)
    atoms.ts              # query atom factories + SSR preload/dehydrate helpers
    retry.ts              # exponential-backoff retry policy
    errors.ts             # typed domain errors
  routes/                 # file-based routes + server routes
  components/ hooks/ providers/ util/   # moved from app/
  ui/                     # vendored from packages/ui (React 19 + Start link/router)
  lib/                    # vendored client hooks, analytics, Supabase client, date
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
- **Client** — `AtomHttpApi.Service()` generates typed query/mutation atoms from
  the same contract. Components read them with `useAtomValue` / `useQuery`
  (`useAtomSuspense`), so there is no hand-written fetch layer on the client.

React Query has been removed. Retries now use Effect's native
`Schedule.exponential("200 millis")` (200ms → 400ms → 800ms → 1.6s, 4 attempts)
through `src/effect/retry.ts`, applied to every request the client and the
Brawlhalla service make. The auth profile fetch uses the same schedule.

### Server-only boundaries

Privileged code is only reachable from the server route that mounts the API:

- `Brawlhalla` / `Database` / `Content` import server-only modules
  (`db/supabase/service`, `web-parser`) and are only imported by `Handlers.ts`
  and `Server.ts`.
- `packages/db/supabase/service.ts` (service-role client) is created lazily, so
  missing credentials fail the request that needs them instead of crashing the
  server at import time.
- Verified: the client bundle contains no `cheerio`, service-role key,
  `HttpApiBuilder`, tRPC, or React Query code.

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
(`INTERNAL_ORIGIN`, else `VERCEL_URL`, else `http://localhost:$PORT`), because
`fetch` cannot resolve a relative URL on the server.

### SSR mode per route

| Route                     | `ssr`                                           | Why                                             |
| ------------------------- | ----------------------------------------------- | ----------------------------------------------- |
| `/`                       | `true`                                          | Landing content has SEO value                   |
| `/rankings/1v1/…`         | `true`, or `'data-only'` when `?player=` is set | Search results are non-canonical                |
| `/rankings/2v2/…`         | `true`                                          | Public, indexable                               |
| `/rankings/clans/…`       | `true`, or `'data-only'` when `?clan=` is set   | Same as 1v1                                     |
| `/rankings/global/…`      | `true`                                          | Public, indexable                               |
| `/rankings/power/…`       | `true`                                          | Public, indexable                               |
| `/stats/player/$playerId` | `true`                                          | Public, indexable; 404 for a missing player     |
| `/stats/clan/$clanId`     | `true`                                          | Public, indexable                               |
| `/calc`                   | `true`                                          | Static tool, indexable                          |
| `/@me/favorites`          | `false`                                         | Content comes from the browser Supabase session |

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
- Every `next.config.js` redirect is preserved as an HTTP 308 route.
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

See `.env.example`. Server-only variables are read at request time through
`process.env`; browser variables are read through `import.meta.env` (Vite
`envPrefix` allows both `VITE_` and the legacy `NEXT_PUBLIC_` prefix).

`pnpm setup:env` (from the repository root) writes the local Supabase URL, keys
and `DATABASE_URL` into `.env.local` after `supabase start`; `.env.local` takes
precedence over `.env`.

`INTERNAL_ORIGIN` optionally pins the origin used for SSR atom preloading.

## Supabase client

`@supabase/supabase-js` v2 types every query from a `Database` schema passed to
`createClient`, so `.from("Table")` and `.rpc("fn")` are typed without a
per-call generic. The schema in `packages/db/supabase/database.types.ts` maps
the Prisma row types onto that shape, so a new Prisma model needs an entry there
before `supabaseService.from("NewTable")` compiles.

`web/src/lib/supabase/client.ts` reimplements the browser client for Vite:
`tsconfig.json` maps the `db/supabase/client` and `db/supabase/auth` imports onto
these files, so shared code keeps importing the same specifiers.

## Deployment (Vercel)

`nitro()` emits the Vercel Build Output API directory (`.vercel/output`) when
built on Vercel. Configure the Vercel project with **root directory `web`**.

## Cutover checklist

1. Deploy `web/` to a preview URL and compare responses against `app/` with
   real environment variables (Brawlhalla API key, Supabase service key).
2. Compare HTML, status codes, redirects, titles/descriptions, and
   `/sitemap.xml` / `/robots.txt`.
3. Point the production domain at the `web` project.
4. Only then remove `app/` and its `next.config.js` redirects.
