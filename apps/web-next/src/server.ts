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
import { cmsMediaPrefix, staticMediaPrefix } from "@crh/common/helpers/media"
import { apiBinding, cmsBinding, envValue } from "@/env"
import { useServerHttpClient } from "@/effect/client"

const API_PREFIX = "/api/v1/"
const TELEMETRY_PATH = "/api/telemetry"

/**
 * Lives on the web worker, not the API binding: fallback telemetry must still
 * land while the API is the thing that failed. No request body is retained.
 */
const telemetry = async (request: Request): Promise<Response> =>
    request.method === "POST"
        ? new Response(null, { status: 204 })
        : new Response(null, { status: 405 })

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

const forwardToCms = async (request: Request): Promise<Response> => {
    if (request.method !== "GET" && request.method !== "HEAD") {
        return new Response(null, {
            status: 405,
            headers: { allow: "GET, HEAD" },
        })
    }

    const url = new URL(request.url)
    const key = url.pathname.slice(staticMediaPrefix.length)
    if (key.length === 0) return new Response(null, { status: 404 })

    const mediaPath = `${cmsMediaPrefix}${key}${url.search}`
    // Conditional requests and ranges pass through so the CMS keeps answering
    // 304/206 instead of resending the body.
    const headers = new Headers(request.headers)
    headers.delete("host")
    // The media route is public; do not hand the user's credentials to it.
    headers.delete("cookie")
    headers.delete("authorization")

    const cms = await cmsBinding()
    if (cms) {
        return cms.fetch(
            new Request(`https://cms.internal${mediaPath}`, {
                method: request.method,
                headers,
            }),
        )
    }

    const devUrl = await envValue("CMS_DEV_URL")
    if (devUrl === undefined) {
        return new Response(
            "No `CMS` service binding. Run the app through the Alchemy stack " +
                "(`pnpm dev`) so web-next can bind the CMS worker.",
            { status: 503, headers: { "content-type": "text/plain" } },
        )
    }

    return fetch(`${devUrl.replace(/\/+$/, "")}${mediaPath}`, {
        method: request.method,
        headers,
    })
}

const startHandler = createStartHandler(defaultStreamHandler)

export default createServerEntry({
    fetch(request: Request) {
        const pathname = new URL(request.url).pathname

        if (pathname === TELEMETRY_PATH) return telemetry(request)
        if (pathname.startsWith(staticMediaPrefix)) {
            return forwardToCms(request)
        }

        return pathname.startsWith(API_PREFIX)
            ? forwardToApi(request)
            : startHandler(request)
    },
})
