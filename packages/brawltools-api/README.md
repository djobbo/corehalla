# @corehalla/brawltools-api

Typed client for the [Brawltools API](https://api.brawltools.com/v2) (community power rankings), built with Effect **HttpApi** and **Schema** (v4). Responses are validated at runtime.

This package mirrors [kubi’s `brawltools-api` service](https://github.com/djobbo/kubi/tree/main/apps/api/src/services/brawltools-api).

## Usage

```ts
import { Effect } from "effect"
import {
    layerBrawltoolsApiClient,
    BrawltoolsApiClientService,
} from "@corehalla/brawltools-api"

const program = Effect.gen(function* () {
    const api = yield* BrawltoolsApiClientService

    const oneVOne = yield* api.powerRankings.oneVOne({
        query: {
            region: "EU",
            page: 1,
            orderBy: "powerRanking",
        },
    })

    const twoVTwo = yield* api.powerRankings.twoVTwo({
        query: {
            region: "NA",
            page: 1,
            orderBy: "points",
            query: "player name",
        },
    })

    return { oneVOne, twoVTwo }
})

program.pipe(Effect.provide(layerBrawltoolsApiClient()))
```

No API key is required. The base URL defaults to `https://api.brawltools.com/v2`.

---

## Endpoints

Both methods call `GET /pr` on the upstream API; the client selects the mode and normalizes query parameters.

| Client method           | Upstream               | Decoded response        |
| ----------------------- | ---------------------- | ----------------------- |
| `powerRankings.oneVOne` | `GET /pr?gameMode=1&…` | `PowerRankingsResponse` |
| `powerRankings.twoVTwo` | `GET /pr?gameMode=2&…` | `PowerRankingsResponse` |

---

## API quirks

### Game mode on the wire

The HTTP API uses numeric `gameMode` values (`1` = 1v1, `2` = 2v2). You choose the mode by calling `oneVOne` or `twoVTwo`; do not pass `gameMode` in the query object.

### `orderBy` query format

The client sends a plain sort field (`top8`, `powerRanking`, `points`, …). Middleware rewrites it to the wire format **`{field} {ASC|DESC}`**:

- `powerRanking` → `powerRanking ASC`
- Any other field → `{field} DESC`

You do not pass `ASC` / `DESC` yourself.

### `maxResults`

If omitted, the client sets **`maxResults=50`** (same default as kubi). Pass `maxResults` in the query to override, or set `maxResults` in `layerBrawltoolsApiClient({ maxResults: … })` for the default injected by middleware.

### Search

Player name filter uses the query parameter **`query`** (not `search` or `name`):

```ts
api.powerRankings.oneVOne({
    query: {
        region: "EU",
        page: 1,
        orderBy: "powerRanking",
        query: "Sandstorm",
    },
})
```

### Regions

Supported region codes: `NA`, `EU`, `SA`, `SEA`, `MENA`, `LAN`. Query params accept uppercase or lowercase; decoded values are uppercase.

### Response shape

- `prPlayers` — list of players with tournament stats (`top8`, `top32`, medals, `powerRanking`, `points`, `earnings`).
- `twitter` / `twitch` may be absent (`optionalKey`).
- `totalPages` — pagination bound for `page`.
- `lastUpdated` — ISO timestamp string from Brawltools.

### What this API does not provide

- Official Brawlhalla ranked leaderboards (use `@corehalla/brawlhalla-api`).
- Endpoints other than power rankings (`/pr`).
- Authentication or API keys.

---

## Development

```bash
pnpm --filter @corehalla/brawltools-api ts:check
```
