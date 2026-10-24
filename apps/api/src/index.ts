import { BUILD_ID, CONTRACT_VERSION } from "@crh/api-contract/schemas"
import { apiHandler } from "./server"
import { pendingWork } from "@crh/core/services/background"

// CORS `*` is safe: auth is same-origin and the session cookie is SameSite=Lax.
const corsHeaders = {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, POST, DELETE, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-expose-headers":
        "x-corehalla-contract, x-corehalla-build, x-corehalla-section-error",
    "access-control-max-age": "86400",
} as const

/** Every response carries the deploy identity, including preflights. */
const versionHeaders = {
    "x-corehalla-contract": String(CONTRACT_VERSION),
    "x-corehalla-build": BUILD_ID,
} as const

export const withCors = (response: Response): Response => {
    const headers = new Headers(response.headers)

    for (const [name, value] of Object.entries({
        ...corsHeaders,
        ...versionHeaders,
    })) {
        headers.set(name, value)
    }

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
    })
}

export { corsHeaders }

// Set in code: Cloudflare's JSON no-cache default is config, not a guarantee.
const isPrivatePath = (pathname: string): boolean =>
    pathname.startsWith("/api/v1/me/") || pathname.startsWith("/api/v1/auth/")

/** Sections assemble from the upstream cache; never add a second edge cache. */
const isSectionPath = (pathname: string): boolean =>
    pathname.startsWith("/api/v1/players/") ||
    pathname.startsWith("/api/v1/guilds/")

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

type ExecutionContext = {
    readonly waitUntil: (promise: Promise<unknown>) => void
}

export default {
    async fetch(request: Request, _env: unknown, ctx: ExecutionContext) {
        if (request.method === "OPTIONS") {
            return new Response(null, {
                status: 204,
                headers: { ...corsHeaders, ...versionHeaders },
            })
        }

        const response = withCors(await apiHandler(request))
        const pathname = new URL(request.url).pathname

        // Structured section failures have already exhausted upstream retries.
        // The client skips its own retries and goes straight to the fallback.
        if (
            isSectionPath(pathname) &&
            (response.status === 502 ||
                response.status === 503 ||
                response.status === 504)
        ) {
            response.headers.set("x-corehalla-section-error", "1")
        }

        const final =
            isPrivatePath(pathname) || isSectionPath(pathname)
                ? withNoStore(response)
                : response

        // Background writes would be cancelled when this returns; waitUntil keeps the isolate alive.
        ctx.waitUntil(pendingWork())

        return final
    },
}
