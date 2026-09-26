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
 * Custom server entry, existing to install the binding-backed HTTP client.
 *
 * Route loaders preload their atoms, and the atoms call `/api/v1/*`. On the
 * server those paths have no origin to resolve against, so instead of inventing
 * one the render calls the API worker over its service binding — the same
 * request the browser makes, minus the network hop and minus any CORS.
 *
 * Nothing else here differs from the default entry.
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
                try: async () => {
                    const api = await apiBinding()

                    if (!api) {
                        throw new Error(
                            "No `API` service binding. Run the app through the " +
                                "Alchemy stack (`pnpm dev:cloud`) so web-next can " +
                                "bind the API worker.",
                        )
                    }

                    return api.fetch(web)
                },
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

const handler = createStartHandler(defaultStreamHandler)

export default createServerEntry({ fetch: handler })
