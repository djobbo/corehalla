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
 * A permissive CORS policy for the public, read-only surface.
 *
 * `*` is the right wildcard for the ladders and lookups rather than a list:
 * those routes are public and cookie-free, so there is nothing for a narrow
 * origin list to protect, and `*` keeps preview deployments from needing an
 * allow-list entry every time one is created.
 *
 * The authenticated surface (`/api/v1/me/*`, `/api/v1/auth/*`) now lives on
 * this worker, and it is served *same-origin*: the API is routed on the app's
 * own hostname (`${hostname}/api/v1/*` and `${nextHostname}/api/v1/*`), and
 * under `alchemy dev` the web worker forwards the path over its service binding.
 * A browser call therefore never crosses an origin, and never needs these
 * headers at all. The session cookie is `SameSite=Lax`, so it is not attached
 * to a cross-site request even if one is made, and `*` without credentials means
 * a cross-origin caller cannot read an authenticated response either. That is
 * what keeps `*` safe here rather than merely convenient — reflecting the origin
 * would be strictly worse, because it would let any site issue a request the
 * browser then attaches the cookie to.
 */
const corsHeaders = {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, POST, DELETE, OPTIONS",
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
 * The paths whose responses are per-user.
 *
 * `me` and `auth` are the only routes on this worker that read a cookie, and a
 * response built from one must never be stored by a shared cache. Cloudflare
 * does not cache JSON by default, but "does not by default" is a property of
 * the current configuration rather than of this code, and one cache rule added
 * later would turn a missing header into one user's favourites served to
 * another. Setting it here, at the transport edge, means no handler has to
 * remember.
 */
const isPrivatePath = (pathname: string): boolean =>
    pathname.startsWith("/api/v1/me/") || pathname.startsWith("/api/v1/auth/")

export const withNoStore = (response: Response): Response => {
    const headers = new Headers(response.headers)

    headers.set("cache-control", "private, no-store")

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
    })
}

export { isPrivatePath }

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
        const final = isPrivatePath(new URL(request.url).pathname)
            ? withNoStore(response)
            : response

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

        return final
    },
}
