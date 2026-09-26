import { createFileRoute } from "@tanstack/react-router"
import { apiBinding } from "@/env"

/**
 * Same-origin pass-through to the API worker.
 *
 * The browser calls `/api/v1/*` on whatever origin serves this app, and this
 * route forwards the request over the service binding. Two consequences, both
 * deliberate:
 *
 * - **There is no API origin to configure.** An absolute origin has to be
 *   written down somewhere, and under `alchemy dev` the API's port is assigned
 *   per run — so a value baked into the build goes stale the moment the stack
 *   restarts, which is exactly the failure this replaces. The binding is
 *   resolved per request from the live environment.
 * - **No CORS is involved.** The browser only ever talks to its own origin; the
 *   cross-worker hop happens inside Cloudflare.
 *
 * The API worker does still send CORS headers, which no longer matters here but
 * remains right for anything that calls it directly.
 */
const forward = async (request: Request): Promise<Response> => {
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

export const Route = createFileRoute("/api/v1/$")({
    server: {
        handlers: {
            GET: ({ request }) => forward(request),
            // Answered here rather than upstream: with the hop inside
            // Cloudflare there is no preflight to make, but a stray one should
            // not surface as a 404.
            OPTIONS: () => new Response(null, { status: 204 }),
        },
    },
})
