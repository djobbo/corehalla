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
import { getCssText } from "@/ui/theme"

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

        const transformed = new Response(
            pipeStitchesCss(ssr.response.body),
            {
                status: ssr.response.status,
                statusText: ssr.response.statusText,
                headers,
            },
        )

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
