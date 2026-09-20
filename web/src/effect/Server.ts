import { Layer } from "effect"
import { FetchHttpClient, HttpRouter, HttpServer } from "effect/unstable/http"
import { HttpApiBuilder } from "effect/unstable/httpapi"
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
 */

const ServicesLayer = Layer.mergeAll(
    BrawlhallaLayer,
    DatabaseLayer,
    ContentLayer,
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

const webHandler = HttpRouter.toWebHandler(ApiLayer, { disableLogger: true })

export const apiHandler = webHandler.handler

/** Releases the API layer's resources (used when the server shuts down). */
export const disposeApi = webHandler.dispose
