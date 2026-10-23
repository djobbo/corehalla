import { Layer } from "effect"
import { FetchHttpClient, HttpRouter, HttpServer } from "effect/unstable/http"
import { HttpApiBuilder, HttpApiScalar } from "effect/unstable/httpapi"
import { layer as sqlLayer } from "@crh/db/client"
import { d1Database } from "@crh/core/env"
import { CorehallaApi } from "@crh/api-contract/Api"
import {
    contentGroup,
    guildsGroup,
    playersGroup,
    rankingsGroup,
    searchGroup,
    upstreamGroup,
} from "./handlers"
import { authGroup, meGroup } from "./auth/handlers"
import { layer as AuthLayer } from "./auth/Auth"
import {
    layer as BrawlhallaLayer,
    rawLayer as UpstreamLayer,
} from "@crh/core/services/upstream"
import { layer as CacheLayer } from "@crh/core/services/cache"
import { layer as BackgroundLayer } from "@crh/core/services/background"
import { layer as ContentLayer } from "./services/content"
import { layer as BrawltoolsLayer } from "./services/brawltools"
import { layer as PowerRankingsLayer } from "./services/power-rankings"
import { layer as PlayerEsportsLayer } from "./services/player-esports"
import { layer as DatabaseLayer } from "@crh/core/services/archive"
import { layer as LookupLayer } from "@crh/core/services/lookup"
import type { D1Database } from "@crh/db/client"

// Lazy: the DB binding is not readable at module scope under the TanStack Start dev server.

// Must stay under `/api/v1/*` — that is the only path Cloudflare routes to this worker.
const DocsPath = "/api/v1/docs" as const

const createHandler = (db: D1Database) => {
    const SqlLayer = sqlLayer(db)

    // `mergeAll` only unions layers; it does not feed one layer's output into another's input.
    const DatabaseWithSql = DatabaseLayer.pipe(Layer.provide(SqlLayer))

    const UpstreamWithDeps = UpstreamLayer.pipe(
        Layer.provide(DatabaseWithSql),
        Layer.provide(FetchHttpClient.layer),
    )

    const ServicesLayer = Layer.mergeAll(
        DatabaseWithSql,
        CacheLayer.pipe(Layer.provide(BackgroundLayer)),
        BackgroundLayer,
        UpstreamWithDeps,
        ContentLayer.pipe(Layer.provide(SqlLayer)),
        BrawltoolsLayer,
        PowerRankingsLayer.pipe(
            Layer.provide(BrawltoolsLayer),
            Layer.provide(CacheLayer),
            Layer.provide(BackgroundLayer),
        ),
        PlayerEsportsLayer.pipe(
            Layer.provide(BrawltoolsLayer),
            Layer.provide(CacheLayer),
            Layer.provide(BackgroundLayer),
        ),
        // Auth shares D1 but is not merged into `DatabaseWithSql` (ranking archive).
        AuthLayer.pipe(Layer.provide(SqlLayer)),
        BrawlhallaLayer.pipe(
            Layer.provide(CacheLayer),
            Layer.provide(UpstreamWithDeps),
            Layer.provide(BackgroundLayer),
            Layer.provide(DatabaseWithSql),
        ),
        LookupLayer.pipe(
            Layer.provide(UpstreamWithDeps),
            Layer.provide(DatabaseWithSql),
        ),
    )

    const ApiLayer = HttpApiBuilder.layer(CorehallaApi).pipe(
        Layer.provide(playersGroup),
        Layer.provide(guildsGroup),
        Layer.provide(rankingsGroup),
        Layer.provide(searchGroup),
        Layer.provide(contentGroup),
        Layer.provide(upstreamGroup),
        Layer.provide(meGroup),
        Layer.provide(authGroup),
        Layer.provide(ServicesLayer),
        // Handlers call Discord through `HttpClient`, so the service stays in the runtime context.
        Layer.provideMerge(FetchHttpClient.layer),
        Layer.provide(HttpServer.layerServices),
    )

    // Merged, not nested: `/api/v1/docs` must match before the API's 404 handler.
    const AppLayer = Layer.mergeAll(
        ApiLayer,
        HttpApiScalar.layerCdn(CorehallaApi, {
            path: DocsPath,
            scalar: {
                theme: "moon",
                defaultOpenAllTags: false,
            },
        }),
    )

    return HttpRouter.toWebHandler(AppLayer)
}

let webHandler: ReturnType<typeof createHandler> | null = null

export const apiHandler = async (request: Request) => {
    if (!webHandler) {
        webHandler = createHandler(await d1Database())
    }

    return webHandler.handler(request)
}

export const disposeApi = async () => {
    await webHandler?.dispose()
    webHandler = null
}
