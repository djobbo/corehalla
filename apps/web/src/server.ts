import {
    createStartHandler,
    defaultStreamHandler,
    defineHandlerCallback,
} from "@tanstack/react-start/server"
import { createServerEntry } from "@tanstack/react-start/server-entry"
import {
    normalizeSsrResponse,
    type HandlerCallbackResult,
} from "@tanstack/react-router/ssr/server"
import { Effect } from "effect"
import {
    HttpClient,
    HttpClientError,
    HttpClientRequest,
    HttpClientResponse,
} from "effect/unstable/http"
import { getCssText } from "@/ui/theme"
import { useInProcessHttpClient } from "@/effect/Client"
import { apiBinding } from "@/env"

/**
 * SSR data loading calls the API worker through its service binding.
 *
 * Route loaders preload their atoms, and the atoms call the `/api/v1/*` routes.
 * Going over HTTP for that needs an absolute origin and, in production, hits the
 * zone's bot protection: the Worker's subrequest to its own hostname is answered
 * with a managed challenge (403), which surfaced as a 500 on every first load.
 * The service binding removes the public origin from the path entirely, so the
 * call never leaves Cloudflare's network and no challenge can apply.
 */
useInProcessHttpClient(
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
                // Resolved per call: the binding only exists inside the Worker.
                async try() {
                    const api = await apiBinding()

                    if (!api) {
                        throw new Error(
                            "No `API` service binding. Deploy (or `pnpm dev:cloud`) " +
                                "so the Alchemy stack can bind the API worker to web.",
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

/**
 * Custom server entry.
 *
 * TanStack Start renders the full document (`<html>`, `<head>`, `<body>`) on the
 * server and streams it. Stitches, however, injects its styles at runtime, so
 * the server HTML would otherwise be missing CSS-in-JS rules until hydration.
 *
 * This wraps the default streaming handler and injects the server-collected
 * Stitches CSS right before `</head>` in the streamed HTML. Injection is
 * best-effort: if the response is not HTML or anything unexpected happens, the
 * original response is returned untouched.
 */
function pipeStitchesCss(body: ReadableStream<Uint8Array>) {
    const decoder = new TextDecoder()
    const encoder = new TextEncoder()
    let buffer = ""
    let injected = false

    return body.pipeThrough(
        new TransformStream<Uint8Array, Uint8Array>({
            transform(chunk, controller) {
                if (injected) {
                    controller.enqueue(chunk)
                    return
                }

                buffer += decoder.decode(chunk, { stream: true })

                const headEnd = buffer.indexOf("</head>")
                if (headEnd === -1) {
                    // Guard against pathological buffering if no head is seen.
                    if (buffer.length > 1_000_000) {
                        controller.enqueue(encoder.encode(buffer))
                        buffer = ""
                        injected = true
                    }
                    return
                }

                // Read the CSS once the shell (and therefore the rendered
                // components) has been produced by the server renderer.
                const css = getCssText()
                const style = css
                    ? `<style id="stitches" data-stitches>${css}</style>`
                    : ""

                controller.enqueue(
                    encoder.encode(
                        buffer.slice(0, headEnd) +
                            style +
                            buffer.slice(headEnd),
                    ),
                )
                buffer = ""
                injected = true
            },
            flush(controller) {
                if (!injected && buffer) {
                    controller.enqueue(encoder.encode(buffer))
                }
            },
        }),
    )
}

async function injectStitchesCss(
    result: HandlerCallbackResult,
): Promise<HandlerCallbackResult> {
    try {
        const ssr = normalizeSsrResponse(result)
        const contentType = ssr.response.headers.get("content-type") ?? ""

        if (!contentType.includes("text/html") || !ssr.response.body) {
            return result
        }

        const headers = new Headers(ssr.response.headers)
        // The injected bytes change the length; let the runtime use chunked
        // transfer instead of a stale Content-Length.
        headers.delete("content-length")

        const transformed = new Response(pipeStitchesCss(ssr.response.body), {
            status: ssr.response.status,
            statusText: ssr.response.statusText,
            headers,
        })

        // Preserve the framework's stream ownership/cleanup contract.
        if (ssr.serverSsrCleanup === "stream") {
            return {
                response: transformed,
                serverSsrCleanup: "stream",
                dispose: ssr.dispose,
            }
        }

        return { response: transformed, serverSsrCleanup: "none" }
    } catch {
        return result
    }
}

const handler = createStartHandler(
    defineHandlerCallback(async (ctx) => {
        return injectStitchesCss(await defaultStreamHandler(ctx))
    }),
)

export default createServerEntry({ fetch: handler })
