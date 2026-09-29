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
import { layer as DatabaseLayer } from "@crh/core/services/archive"
import { layer as LookupLayer } from "@crh/core/services/lookup"
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

/**
 * Where the Scalar API reference is mounted.
 *
 * Must live under the API's own route pattern (`/api/v1/*`) because that is the
 * only path Cloudflare routes to this worker — a page at `/docs` would fall
 * through to whichever app owns the apex domain.
 *
 * The CDN build of Scalar is used rather than the bundled one on purpose: the
 * bundled script is a few megabytes of JavaScript, and inlining it would put
 * that into every cold start of a worker that otherwise serves JSON. The page
 * is a developer tool, so one network fetch when someone opens it is the right
 * trade.
 */
const DocsPath = "/api/v1/docs" as const

const createHandler = (db: D1Database) => {
    // One D1 client for the whole server; `Database.layer` consumes it.
    const SqlLayer = sqlLayer(db)

    // `BrawlhallaLayer` now reads the archive (for `getClanXp`), and
    // `Layer.mergeAll` does not feed one layer's output into another's input —
    // it only unions them. So the archive is built once here and provided to
    // both consumers; Effect memoises the shared value within the build.
    const DatabaseWithSql = DatabaseLayer.pipe(Layer.provide(SqlLayer))

    // Built once and shared: the lookup federates over the same uncached
    // `Upstream` the gateway wraps, and `BrawlhallaLayer` now takes it as a
    // requirement rather than providing its own.
    const UpstreamWithDeps = UpstreamLayer.pipe(
        Layer.provide(DatabaseWithSql),
        Layer.provide(FetchHttpClient.layer),
    )

    const ServicesLayer = Layer.mergeAll(
        DatabaseWithSql,
        /*
         * The cache refreshes a stale entry behind the response, so it needs
         * `Background` to keep that refresh alive. `mergeAll` only unions — it
         * does not feed one layer's output into another's input — so the
         * requirement is discharged here rather than by the `BackgroundLayer`
         * beside it.
         */
        CacheLayer.pipe(Layer.provide(BackgroundLayer)),
        /*
         * Bookkeeping writes are handed here rather than awaited, and the
         * worker entry keeps the isolate alive for them with `waitUntil` — see
         * `@crh/core/services/background`. Provided at build time because
         * `toWebHandler` accepts no requirement other than the router's own.
         */
        BackgroundLayer,
        UpstreamWithDeps,
        ContentLayer.pipe(Layer.provide(SqlLayer)),
        /*
         * App-owned auth: sessions, favourites and Discord connections. It
         * reads the same D1 client the archive does, but is deliberately not
         * merged into `DatabaseWithSql` — that service is the ranking archive,
         * and auth has no business depending on it.
         */
        AuthLayer.pipe(Layer.provide(SqlLayer)),
        /*
         * The cached gateway writes what a refresh returns, so it needs the
         * archive and somewhere to put the write. Both are also in `mergeAll`
         * below and `mergeAll` only unions — it does not feed one layer's output
         * into another's input — so each is provided explicitly.
         */
        BrawlhallaLayer.pipe(
            Layer.provide(CacheLayer),
            Layer.provide(UpstreamWithDeps),
            Layer.provide(BackgroundLayer),
            Layer.provide(DatabaseWithSql),
        ),
        // The lookup needs both: `Upstream` to federate over, and the archive
        // for the alias and clan indexes. `mergeAll` only unions layers, so
        // each requirement is discharged explicitly.
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
        Layer.provide(FetchHttpClient.layer),
        Layer.provide(HttpServer.layerServices),
    )

    /*
     * The API and its reference are two routers on one server, so they are
     * merged rather than nested: `toWebHandler` supplies the router both need,
     * and a request to `/api/v1/docs` is matched by the second before the
     * first's 404 handler can see it.
     */
    const AppLayer = Layer.mergeAll(
        ApiLayer,
        HttpApiScalar.layerCdn(CorehallaApi, {
            path: DocsPath,
            scalar: {
                // Matches the app's own dark surface rather than Scalar's
                // default white, so the reference does not flash when opened
                // from a dark-themed page.
                theme: "moon",
                defaultOpenAllTags: false,
            },
        }),
    )

    // The default logger is kept on. It was disabled here, which meant a defect
    // produced a bare 500 with nothing written anywhere — the handler's cause
    // was discarded by the same switch that silenced the request log, so a
    // failing endpoint could only be diagnosed by guessing. An error nobody can
    // read is not worth the log volume it saves.
    return HttpRouter.toWebHandler(AppLayer)
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
