# Next

Ideas and gaps for `apps/web-next`. Assessed against `apps/web`, the API
contract (`packages/api-contract`), and the `bhapi` / `db` packages.

## Already covered in web-next

Landing, command-palette search, live 1v1/2v2/3v3 ladders and queues, career
rankings (players / legends / weapons), clan and guild rankings plus guild
profile, full player profiles (overview / 2v2 / legends / weapons with bubble
charts), favourites and Discord account control.

## Gaps

### API and atoms already exist, no UI

Cheapest wins — the backend, and sometimes the atom, is already written.

- **Power rankings route.** `powerRankingsAtom` is defined at
  `src/effect/atoms.ts:93` with no route consuming it. `apps/web` ships
  `rankings/power.{-$bracket}.{-$region}.tsx`.
- **News and free legend rotation.** `Api.ts` exposes
  `content.getWeeklyRotation` and `content.getBHArticles`; legacy `apps/web`
  renders both on the landing (`WeeklyRotation.tsx`, `ArticlePreviewGrid.tsx`).
  web-next has neither atom. This is the "reason to return this week" content.
- **Player-alias search page.** The contract has a paginated
  `search.searchPlayerAlias`; web-next only wires `lookup` into the palette.
  `apps/web` has `/search` for the long-tail old-name case.
- **Glory / ELO-reset calculator.** Pure client-side, no data needed.
  `@crh/bhapi/calculator` (`getGloryFromWins`, `getGloryFromBestRating`,
  `getPersonalEloReset`, `getLegendEloReset`) already exists. Reference:
  `apps/web/src/routes/calc.tsx`.

### Infrastructure / hygiene

Blockers if web-next is to become the main app.

- **SEO**: no `sitemap[.]xml`, no `robots[.]txt`, no OG-image generation.
  Legacy has `public/images/og` and `components/SEO.tsx`; web-next only sets
  `head()` on a couple of routes. A stats site lives off search traffic.
- **Legal / redirects**: `privacy`, `donate` / `kofi`, and the
  `wiki` / `github` / `discord` / `twitter` redirect stubs all exist in
  `apps/web`, not here.
- **Short-link and self routes**: `p.$` / `c.$` slug redirects and `stats/me`.
- **Analytics**: legacy wires AdSense placements; web-next has none.

### Proposed features

- **Tier list maker** (Effect + Foldkit). Decide persistence first: URL-encoded
  (shareable, zero backend) vs server-saved (new table scoped to
  `userSession.userId` like favourites). Start URL-encoded, add optional save
  for logged-in users. Pairs with a counter-pick / matchup tool. Label lists as
  user-made.
- **Cassidy's Cupcakes** (Effect + Foldkit, client-only).
  https://github.com/pbfy0/CassidysCupcakes — cookie clicker with Brawlhalla
  assets. Ship as clickable cookie easter eggs across the site, plus a full
  page for the game. Guardrails: lazy-load the full game (route-level dynamic
  import / `ClientOnly`) so it never touches the SSR bundle; check upstream
  license and credit it. Keep the cookie out of the SSR/render path so it can't
  break hydration or `PageLoader`. Consider a small localStorage-persisted
  counter that unlocks the game page.

## Other ideas, by value

### High value, data already there

- **Head-to-head comparison** (`/vs`) and **legend comparison** — diff stat
  grids, reuse `StatGrid` / `BubbleChart`.
- **Legend detail pages** — stats, signature moves, best weapons, top players.
  Strong SEO surface; data comes from existing legend/weapon rankings.
- **Server-rendered OG image cards** for players / guilds (satori or a Worker).
  High impact for Discord and social sharing.
- **Surface the Discord bot** (`apps/worker`) on-site: connection status,
  invite, command docs.

### Engagement

- **Daily puzzle** ("guess the legend / player from stats", Wordle-style).
  Cheap, client-only, strong retention.
- **Rating / rank history graphs.** Needs a data-layer addition:
  `packages/db/schema.ts` only stores `lastUpdated` snapshots, no time series.
  The crawler must start appending history rows first. Real cost, not UI-only.

### Tournament / community

- **Bracket generator** and **scrim / tournament finder** — natural adjacency to
  the Discord community and the Guilds section.

## Suggested order

1. Power rankings route + landing rotation/news.
2. SEO/OG, sitemap/robots, legal and redirects — required before replacing
   `apps/web`.
3. Glory / ELO calculator.
4. Tier list maker (shareable URLs).
5. Daily puzzle.
6. Cassidy's Cupcakes easter eggs + lazy full game.
