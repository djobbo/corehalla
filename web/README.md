# web — Corehalla on TanStack Start

This package is the TanStack Start migration of the Next.js app in `app/`. Both
apps run side by side until the cutover is complete.

- **Bundler:** Vite 8
- **Framework:** TanStack Start + TanStack Router (file-based routes)
- **Deployment:** Nitro (`node-server` locally, the `vercel` preset on Vercel)
- **UI:** React 19, Tailwind CSS v4 (CSS-first config), Stitches, Radix, kbar
- **Data:** typed server functions delegating to the existing tRPC router in
  `packages/server` (unchanged)

## Commands

```sh
pnpm --filter web dev        # vite dev on http://localhost:3000
pnpm --filter web build      # vite build (+ route tree generation)
pnpm --filter web start      # node .output/server/index.mjs
pnpm --filter web ts:check   # tsc --noEmit
```

> The production server reads configuration from the runtime environment.
> For local production previews run
> `node --env-file=.env .output/server/index.mjs`.

## Architecture

```
src/
  router.tsx              # createRouter(routeTree)
  start.ts                # CSRF middleware for server functions
  server.ts               # custom server entry: injects Stitches CSS into SSR <head>
  routes/                 # file-based routes + server routes
  server/                 # typed server functions and server-only helpers
  components/ hooks/ providers/ util/   # moved from app/
  ui/                     # vendored from packages/ui (React 19 + Start link/router)
  lib/                    # vendored client hooks, analytics, Supabase client
  styles/app.css          # Tailwind v4 entry + design tokens
```

### Server-only boundaries

All privileged work sits behind `createServerFn`:

- `src/server/caller.server.ts` is a `.server.ts` module (import-protected) that
  creates a tRPC caller: `appRouter.createCaller({})`.
- `src/server/api.functions.ts` validates input with zod and delegates to the
  matching procedure. The tRPC procedures and `packages/server` are unchanged.
- Route loaders and components only ever call those typed functions; the build
  replaces the handlers with RPC stubs in the browser bundle.

`packages/db/supabase/service.ts` (service-role client) is only reachable from
server functions. It is now created lazily, so a missing Supabase configuration
fails the request that needs it instead of crashing the whole server at import
time.

### SSR mode per route

| Route | `ssr` | Why |
| --- | --- | --- |
| `/` | `true` (default) + streaming | Landing content has SEO value; rotation/news are deferred |
| `/rankings/1v1/…` | `true`, or `'data-only'` when `?player=` is set | Search results are non-canonical; the loader still runs on the server |
| `/rankings/2v2/…` | `true` | Public, indexable |
| `/rankings/clans/…` | `true`, or `'data-only'` when `?clan=` is set | Same as 1v1 |
| `/rankings/global/…` | `true` | Public, indexable |
| `/rankings/power/…` | `true` | Public, indexable |
| `/stats/player/$playerId` | `true` | Public, indexable; 404 for a missing player |
| `/stats/clan/$clanId` | `true` | Public, indexable |
| `/calc` | `true` | Static tool, indexable, no server data |
| `/@me/favorites` | `false` | Content comes from the browser Supabase session |

`/@me/favorites` also returns `Cache-Control: private, no-store` and
`robots: noindex`.

### Search params

Validated with zod and kept in the URL:

- `/rankings/1v1/…?player=` — validated, part of `loaderDeps`
- `/rankings/clans/…?clan=` — validated, part of `loaderDeps`
- `/rankings/global/…?sortBy=` — validated, part of `loaderDeps`
- `/rankings/power/…?q=` — validated, client-side filter (not a loader dep)

`stripSearchParams` keeps default values out of the canonical URL so the server
does not redirect `/rankings/1v1` to `/rankings/1v1?player=`.

### Streaming

The index loader returns the weekly rotation and news as promises. The server
renders and streams the shell immediately, then streams each section through
`<Await>` + `<Suspense>`. Measured locally with a browser user agent: first
bytes in ~70 ms.

Crawlers (detected by `isbot`) intentionally receive the fully settled document
instead of a stream.

### Routes and redirects

- Optional path params (`/rankings/1v1/{-$region}/{-$page}`) replace the
  Next.js optional catch-alls, so `/rankings/1v1`, `/rankings/1v1/eu` and
  `/rankings/1v1/eu/2` are all served by one route file.
- Every `next.config.js` redirect is preserved as an HTTP 308 route:
  `/wiki`, `/discord`, `/github`, `/twitter`, `/kofi`, `/donate`, `/stats/me`,
  `/rankings`, `/leaderboard/*`, `/p/*`, `/c/*`.
- `/sitemap.xml` and `/robots.txt` are dynamic server routes driven by
  `SITE_URL`. The stale `next-sitemap` output that used to live in
  `app/public/` was removed so it cannot shadow them (a `next build`
  regenerates it for the legacy app).
- `packages/*` API routes are preserved as TanStack Start server routes under
  `/api/*`, including `/api/trpc/*`.

## Environment variables

See `.env.example`. Server-only variables are read at request time through
`process.env`; browser variables are read through `import.meta.env` (Vite
`envPrefix` allows both `VITE_` and the legacy `NEXT_PUBLIC_` prefix so the
deployed environment does not have to change).

## Deployment (Vercel)

`nitro()` emits the Vercel Build Output API directory (`.vercel/output`) when
built on Vercel. Configure the Vercel project with **root directory `web`**;
`web/vercel.json` disables framework detection and uses `pnpm build`.

`vercel.json` in `app/` still describes the legacy Next.js deployment.

## Cutover checklist

1. Deploy `web/` to a preview URL and compare responses against `app/` with
   real environment variables (Brawlhalla API key, Supabase service key).
2. Compare HTML, status codes, redirects, titles/descriptions, and
   `/sitemap.xml` / `/robots.txt`.
3. Point the production domain at the `web` project.
4. Only then remove `app/` and its `next.config.js` redirects.
