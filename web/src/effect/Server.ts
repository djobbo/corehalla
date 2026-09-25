import { Layer } from "effect"
import { FetchHttpClient, HttpRouter, HttpServer } from "effect/unstable/http"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { layer as sqlLayer } from "db/client"
import { d1Database } from "@/env"
import { CorehallaApi } from "./Api"
import {
    contentGroup,
    rankingsGroup,
    searchGroup,
    statsGroup,
} from "./Handlers"
import { layer as BrawlhallaLayer } from "./Brawlhalla"
import { layer as ContentLayer } from "./Content"
import { layer as DatabaseLayer } from "./Database"
import type { D1Database } from "db/client"

/**
 * Builds the Effect HTTP API into a WHATWG `fetch` handler.
 *
 * The handler is mounted by the TanStack Start server route at `/api/effect/$`
 * and serves every endpoint declared in `Api.ts`. `HttpRouter.toWebHandler`
 * owns the router layer; the group handlers, domain services, and HTTP platform
 * services are provided here.
 *
 * Each group layer is provided individually so the group-service requirements
 * are discharged one at a time; merging them first loses the precise service
 * types in this release candidate.
 *
 * The handler is built lazily on the first request because the `DB` binding is
 * not readable at module scope under the TanStack Start dev server. It is then
 * cached for the isolate's lifetime.
 */

const createHandler = (db: D1Database) => {
    // One D1 client for the whole server; `Database.layer` consumes it.
    const SqlLayer = sqlLayer(db)

    const ServicesLayer = Layer.mergeAll(
        BrawlhallaLayer,
        DatabaseLayer,
        ContentLayer,
    ).pipe(Layer.provide(SqlLayer))

    const ApiLayer = HttpApiBuilder.layer(CorehallaApi).pipe(
        Layer.provide(rankingsGroup),
        Layer.provide(statsGroup),
        Layer.provide(searchGroup),
        Layer.provide(contentGroup),
        Layer.provide(ServicesLayer),
        Layer.provide(FetchHttpClient.layer),
        Layer.provide(HttpServer.layerServices),
    )

    return HttpRouter.toWebHandler(ApiLayer, { disableLogger: true })
}

let webHandler: ReturnType<typeof createHandler> | null = null

export const apiHandler = async (request: Request) => {
    if (!webHandler) {
        webHandler = createHandler(await d1Database())
    }

    return webHandler.handler(request)
}

/** Releases the API layer's resources (used when the server shuts down). */
export const disposeApi = async () => {
    await webHandler?.dispose()
    webHandler = null
}
