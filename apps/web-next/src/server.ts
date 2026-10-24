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
} from "effect/http"
import { apiBinding } from "@/env"
import { useServerHttpClient } from "@/effect/client"

const API_PREFIX = "/api/v1/"

const forwardToApi = async (request: Request): Promise<Response> => {
    const api = await apiBinding()

    if (!api) {
        // text/plain: JSON would decode cleanly and hide this as an empty page.
        return new Response(
            "No `API` service binding. Run the app through the Alchemy stack " +
                "(`pnpm dev:cloud`) so web-next can bind the API worker.",
            { status: 503, headers: { "content-type": "text/plain" } },
        )
    }

    return api.fetch(request)
}

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
