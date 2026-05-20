# @corehalla/brawlhalla-api

Typed client for the [official Brawlhalla API](https://api.brawlhalla.com), built with Effect **HttpApi** and **Schema** (v4). Responses are validated at runtime; decoded models apply the normalizations described below.

## Usage

```ts
import { Effect, Redacted } from "effect"
import {
    layerBrawlhallaApiClient,
    BrawlhallaApiClientService,
} from "@corehalla/brawlhalla-api"

const program = Effect.gen(function* () {
    const api = yield* BrawlhallaApiClientService
    return yield* api.player.stats({ params: { playerId: 1234567 } })
})

program.pipe(
    Effect.provide(
        layerBrawlhallaApiClient({
            apiKey: Redacted.make(process.env.BRAWLHALLA_API_KEY!),
        }),
    ),
)
```

Set `BRAWLHALLA_API_KEY` in the environment. Every request sends `api_key` as a query parameter (see `ApiKeyMiddleware`).

Endpoints mirror `bhapi` / kubi: player stats & ranked, clan, rankings (`1v1` / `2v2` / `rotating`), Steam search, legends.

---

## API quirks

The upstream API is inconsistent. This package documents the behavior and, where possible, normalizes it in schemas (ported from [kubi’s brawlhalla-api service](https://github.com/djobbo/kubi/tree/main/apps/api/src/services/brawlhalla-api)).

### Regions

| Where                                                 | Wire format                                                          | Decoded type                                            |
| ----------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------- |
| Most fields (`PlayerRanked.region`, rankings, etc.)   | Region slug (`eu`, `us-e`, …), sometimes `none`, sometimes uppercase | `RankedRegion` slug or `null` via `BrawlhallaApiRegion` |
| **Ranked 2v2 teams** (`PlayerRanked["2v2"][].region`) | **Numeric index** (1-based into an internal region list)             | **`number`** (left as-is; not a slug)                   |

`RankedRegionParamSchema` accepts lowercase or uppercase slugs in **path** params (e.g. rankings URLs) and normalizes to a lowercase slug.

Numeric region indices on 2v2 entries are mapped with `rankedRegions[index - 1]` when you need a slug elsewhere; the raw index is kept on the team object because that is what the API returns.

### Rotating ranked (`rotating_ranked`)

On `/player/:id/ranked`:

- **No games played:** the API returns an **empty array** `[]`.
- **Has games:** it returns a **single object** with `name`, `rating`, `wins`, `games`, etc.

This package decodes that to **`RotatingRanked | null`**: `[]` becomes `null`, an object is validated as `RotatingRanked`. See `ApiRotatingRanked` in `src/schema/player-ranked.ts`.

### Tiers

- **`null` tier** on the wire means **Valhallan** (API quirk). Decoded as `"Valhallan"` via `BrawlhallaApiTier`.
- **`"none"`** means unranked → decoded as `null`.
- Unknown tier strings decode to `null`.

### Placement matches and `peak_rating`

If a player has **not finished all 10 placement games**, the API often returns **`peak_rating: 0`**. The schema accepts the number as returned; interpret `0` with care in UI (it may mean “still in placements”, not a real peak).

### Ranked 2v2 teams

- **`teamname`** is one **concatenated string** (both players’ names run together), not an array of names. Use `brawlhalla_id_one` / `brawlhalla_id_two` to identify players.
- There is **no per-player rating** on 2v2 team rows—only team-level `rating`, `peak_rating`, `tier`, etc.

### Rankings (leaderboards)

- Pages are **1-based** in the URL: `/rankings/1v1/{region}/{page}`, `/rankings/2v2/{region}/{page}`, `/rankings/rotating/{region}/{page}` (client: `rankings.oneVOne`, `rankings.twoVTwo`, `rankings.rotating`).
- The API only exposes leaderboard data up to **page 1000**; there is no further pagination beyond that.
- Optional `name` filter is supported for **1v1** only (`rankings.oneVOne`, query param `name`); behavior matches the official API.

### Search

- **Steam ID search** is available: `GET /search?steamid=…`.
- There is **no official 2v2 / team search** endpoint.

### Clan (guild) XP fields

Breaking rename from older API docs:

| Field              | Meaning                                    |
| ------------------ | ------------------------------------------ |
| `clan_xp`          | **Current** guild XP (string on the wire)  |
| `clan_lifetime_xp` | **Legacy** total clan XP (optional number) |

**Member `xp`** on each entry in `clan[]` is still the **old** per-member XP. The API does not expose a separate “new” member XP field—only the clan-level `clan_xp` was updated.

### Other wire formats (handled by schemas)

- **Damage stats** in player stats / legends are often **strings**, not numbers.
- **Valhallan** and placement edge cases aside, IDs and names are normalized (`BrawlhallaName` runs `cleanString` for encoding quirks).
- Clan responses may omit `clan_lifetime_xp`; it is optional in the `Clan` schema.

---

## What this package does _not_ enforce

These are API/platform limits, not schema bugs:

- Leaderboard depth beyond page **1000**
- **2v2 search** (not provided by Brawlhalla)
- Semantics of **`peak_rating: 0`** during placements (documented above; no automatic inference)
- Converting **2v2 `region` indices** to slugs on the team object itself (kept as `number` by design)

---

## Development

```bash
pnpm --filter @corehalla/brawlhalla-api ts:check
```

Schemas are the source of truth for decoded shapes; see `src/schema/` and `src/api/definition.ts`.
