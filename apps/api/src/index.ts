import { apiHandler } from "./server"
import { pendingWork } from "@crh/core/services/background"

/**
 * Cloudflare Worker entry for the Corehalla API.
 *
 * Serves the Effect `HttpApi` at `/api/v1/*`. `HttpRouter.toWebHandler` returns
 * a WHATWG `fetch` handler, which is exactly what a Workers module needs, so no
 * platform-specific server layer is required.
 *
 * This worker used to carry the crawler too. That moved to `@crh/crawler` so the
 * two stop contending for one upstream allowance: the crawler cannot spend the
 * share reserved for user requests, and a slow crawl cannot affect request
 * latency. The split is about our own accounting — the v1 limit is per IP and
 * Workers egress from shared Cloudflare addresses, so it does not create a
 * second allowance upstream.
 *
 * Bindings are read lazily inside the handler through `@crh/core/env`, because
 * they do not exist at module scope.
 */

/**
 * A permissive CORS policy, applied because a second frontend now calls this API
 * from a different origin.
 *
 * `*` is the right wildcard here rather than a list: every route on this worker
 * is public, read-only and cookie-free — the authenticated surface (sessions,
 * favourites, OAuth) lives in the Start app and is not served from here at all.
 * With no credentials involved there is nothing for a narrow origin list to
 * protect, and `*` keeps preview deployments from needing an allow-list entry
 * every time one is created.
 *
 * The cost is that this becomes wrong the day an authenticated route is added to
 * this worker; at that point the origin list has to become explicit and
 * credentials have to be enabled deliberately.
 */
const corsHeaders = {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
} as const

export const withCors = (response: Response): Response => {
    const headers = new Headers(response.headers)

    for (const [name, value] of Object.entries(corsHeaders)) {
        headers.set(name, value)
    }

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
    })
}

export { corsHeaders }

/**
 * The slice of Cloudflare's `ExecutionContext` this worker uses.
 *
 * Declared locally rather than pulled from `@cloudflare/workers-types`, which
 * would otherwise be the only reason this file names a platform type.
 */
type ExecutionContext = {
    readonly waitUntil: (promise: Promise<unknown>) => void
}

export default {
    async fetch(request: Request, _env: unknown, ctx: ExecutionContext) {
        // Preflight never reaches the router: it is a browser question about
        // permission, not an API request.
        if (request.method === "OPTIONS") {
            return new Response(null, { status: 204, headers: corsHeaders })
        }

        const response = withCors(await apiHandler(request))

        /*
         * The response exists; the work the request started may not have
         * finished. Handlers hand their bookkeeping writes to `Background`
         * rather than awaiting them, which keeps them off the response's
         * critical path — but a fiber the runtime cannot see is cancelled the
         * moment this function returns, so those writes would be lost in
         * silence.
         *
         * `waitUntil` is the only thing that buys both: the response leaves
         * immediately *and* the isolate stays alive until the writes land.
         * Called unconditionally — an empty set is an already-resolved promise.
         */
        ctx.waitUntil(pendingWork())

        return response
    },
}
