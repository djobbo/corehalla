import {
    createStartHandler,
    defaultStreamHandler,
} from "@tanstack/react-start/server"
import { createServerEntry } from "@tanstack/react-start/server-entry"
import { Effect } from "effect"
import {
    HttpClient,
    HttpClientError,
    HttpClientRequest,
    HttpClientResponse,
} from "effect/unstable/http"
import { apiBinding } from "@/env"
import { useServerHttpClient } from "@/effect/client"

/**
 * Custom server entry.
 *
 * It does two things: install the HTTP client the *render* uses to reach the
 * API, and forward browser `/api/v1/*` requests to the API worker.
 *
 * ## Why forwarding lives here and not in a route
 *
 * It is transport, not routing. `/api/v1/*` is a different service, so it is
 * answered before the router is consulted rather than by a route that pretends
 * the path belongs to this app's URL space.
 *
 * ## Why it only matters in development
 *
 * In production this handler never sees an `/api/v1/*` request. The API worker
 * claims that path on this app's own hostname (see its `routes` in
 * `alchemy.run.ts`), so Cloudflare routes it straight there — the browser makes
 * an ordinary same-origin call, with no hop, no proxy and no CORS. Under
 * `alchemy dev` there is no shared hostname to route on, because each worker
 * gets its own local port, so this forward is what keeps dev working. Production
 * therefore runs no forwarding code at all.
 *
 * A service binding is used rather than an origin because the API's dev port is
 * reassigned on every run: an origin captured at build time goes stale, and the
 * app starts calling whatever now occupies that port. That failure surfaced as a
 * CORS error in the browser and a decode error on the server, neither of which
 * pointed at the cause.
 */
const API_PREFIX = "/api/v1/"

const forwardToApi = async (request: Request): Promise<Response> => {
    const api = await apiBinding()

    if (!api) {
        return new Response(
            "No `API` service binding. Run the app through the Alchemy stack " +
                "(`pnpm dev:cloud`) so web-next can bind the API worker.",
            { status: 503, headers: { "content-type": "text/plain" } },
        )
    }

    return api.fetch(request)
}

/**
 * Server-render client for the same binding.
 *
 * Route loaders preload their atoms, and the atoms call `/api/v1/*`. On the
 * server those paths have no origin to resolve against, so instead of inventing
 * one the render calls the API worker directly.
 *
 * Installed before the handler below is constructed: `Layer.suspend` defers the
 * atom runtime's layer until first use, but the client has to be in place by
 * then, and installing it first keeps the ordering obvious.
 */
useServerHttpClient(
    HttpClient.make((request, _url, signal) =>
        Effect.gen(function* () {
            const web = yield* HttpClientRequest.toWeb(request, {
                signal,
            }).pipe(
                Effect.mapError(
                    (cause) =>
                        new HttpClientError.HttpClientError({
                            reason: new HttpClientError.InvalidUrlError({
                                request,
                                cause,
                            }),
                        }),
                ),
            )

            const response = yield* Effect.tryPromise({
                try: () => forwardToApi(web),
                catch: (cause) =>
                    new HttpClientError.HttpClientError({
                        reason: new HttpClientError.TransportError({
                            request,
                            cause,
                        }),
                    }),
            })

            return HttpClientResponse.fromWeb(request, response)
        }),
    ),
)

const startHandler = createStartHandler(defaultStreamHandler)

export default createServerEntry({
    fetch: (request: Request) =>
        new URL(request.url).pathname.startsWith(API_PREFIX)
            ? forwardToApi(request)
            : startHandler(request),
})
