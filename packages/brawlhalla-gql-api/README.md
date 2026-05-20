# @corehalla/brawlhalla-gql-api

Typed client for the [Brawlhalla CMS GraphQL API](https://cms.brawlhalla.com/graphql) (WordPress posts), built with Effect **HttpApi** and **Schema** (v4). Responses are validated at runtime.

Ported from [kubi’s `brawlhalla-gql` service](https://github.com/djobbo/kubi/tree/main/apps/api/src/services/brawlhalla-gql).

## Usage

```ts
import { Effect } from "effect"
import {
    layerBrawlhallaGqlApiClient,
    BrawlhallaGqlApiClientService,
    getWeeklyRotation,
} from "@corehalla/brawlhalla-gql-api"

const articlesProgram = Effect.gen(function* () {
    const api = yield* BrawlhallaGqlApiClientService

    const preview = yield* api.articles.preview({ payload: {} })

    const posts = yield* api.articles.list({
        payload: { first: 6, category: "news" },
    })

    const withHtml = yield* api.articles.withContent({
        payload: { first: 1, category: "weekly-rotation" },
    })

    return { preview, posts, withHtml }
})

const rotationProgram = getWeeklyRotation.pipe(
    Effect.provide(layerBrawlhallaGqlApiClient()),
)

articlesProgram.pipe(Effect.provide(layerBrawlhallaGqlApiClient()))
```

No API key is required. Base URL defaults to `https://cms.brawlhalla.com/graphql`.

---

## Endpoints

All methods use `POST /graphql`. The client sends a JSON body `{ query, variables }`; middleware injects the correct GraphQL document for each method.

| Client method          | GraphQL                           | Payload                               | Response           |
| ---------------------- | --------------------------------- | ------------------------------------- | ------------------ |
| `articles.list`        | Posts query **without** `content` | `PostsVariables`                      | `ArticlesResponse` |
| `articles.withContent` | Posts query **with** `content`    | `PostsVariables`                      | `ArticlesResponse` |
| `articles.preview`     | List query, **`first: 3`** fixed  | `PostsVariables` (optional overrides) | `ArticlesResponse` |

### `PostsVariables`

| Field      | Type      | Description                                   |
| ---------- | --------- | --------------------------------------------- |
| `first`    | `number?` | Page size (default `6` in the query document) |
| `category` | `string?` | WordPress category slug (`categoryName`)      |
| `after`    | `string?` | Cursor from `pageInfo.endCursor`              |

### Weekly rotation helper

`getWeeklyRotation` loads the latest `weekly-rotation` post (with HTML `content`), parses the free-to-play legend list with **cheerio**, and matches names against `bhapi` legend metadata:

```ts
// [{ id, name_key, name }, ...]
yield * getWeeklyRotation
```

Use `parseWeeklyRotation(html)` directly if you already have post HTML.

---

## API quirks

### WordPress / WPGraphQL shape

- Responses are nested: `data.posts.nodes[]`, not a flat array.
- Field names are **camelCase** (`dateGmt`, `featuredImage`, …).
- Image `width` / `height` in `sizes` may arrive as strings; the schema uses `NumberFromString`.
- `content` is only present when using `articles.withContent` (or when the upstream query includes it).

### Weekly rotation HTML

- The CMS stores rotation info in post **HTML**, not structured GraphQL fields.
- Parsing looks for a paragraph containing **“free-to-play legend rotation”** and the following `<ul>` list.
- Legend lines use `" – "` between display name and description; only the segment before the dash is matched to `bio_name` in `bhapi/legends`.
- Unmatched names are dropped silently (same as kubi).

### Pagination

- Use `after` with `pageInfo.endCursor` from the previous response for the next page.

### What this API does not provide

- Official Brawlhalla game stats (use `@corehalla/brawlhalla-api`).
- Power rankings (use `@corehalla/brawltools-api`).
- Authentication.

---

## Development

```bash
pnpm --filter @corehalla/brawlhalla-gql-api ts:check
```
