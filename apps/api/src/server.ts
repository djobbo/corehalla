import { Layer } from "effect"
import { FetchHttpClient, HttpRouter, HttpServer } from "effect/unstable/http"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { layer as sqlLayer } from "@crh/db/client"
import { d1Database } from "./env"
import { CorehallaApi } from "@crh/api-contract/Api"
import {
    contentGroup,
    rankingsGroup,
    searchGroup,
    statsGroup,
} from "./handlers"
import { layer as BrawlhallaLayer } from "./services/upstream"
import { layer as ContentLayer } from "./services/content"
import { layer as DatabaseLayer } from "./services/archive"
import type { D1Database } from "@crh/db/client"

/**
 * Builds the Effect HTTP API into a WHATWG `fetch` handler.
 *
 * The handler is the Worker's `fetch` export (see `index.ts`)
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

    // `BrawlhallaLayer` now reads the archive (for `getClanXp`), and
    // `Layer.mergeAll` does not feed one layer's output into another's input —
    // it only unions them. So the archive is built once here and provided to
    // both consumers; Effect memoises the shared value within the build.
    const DatabaseWithSql = DatabaseLayer.pipe(Layer.provide(SqlLayer))

    const ServicesLayer = Layer.mergeAll(
        DatabaseWithSql,
        ContentLayer.pipe(Layer.provide(SqlLayer)),
        BrawlhallaLayer.pipe(Layer.provide(DatabaseWithSql)),
    )

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
