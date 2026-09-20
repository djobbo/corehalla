import { AtomHttpApi } from "effect/unstable/reactivity"
import { FetchHttpClient } from "effect/unstable/http"
import { CorehallaApi } from "./Api"
import { withRetry } from "./retry"

/**
 * Origin used for server-side rendering.
 *
 * Route loaders preload atoms on the server, and the atoms call the mounted
 * `/api/effect/*` routes over HTTP. During SSR that request has to target this
 * deployment's own origin, because `fetch` cannot resolve a relative URL on the
 * server.
 *
 * On Node the process environment is authoritative; on Cloudflare the deploy
 * binds `VITE_SITE_URL` (inlined at build time) so the self-fetch has a target.
 */
const serverOrigin = () => {
    const env = globalThis.process?.env ?? {}

    if (env.INTERNAL_ORIGIN) return env.INTERNAL_ORIGIN
    if (env.SITE_URL) return env.SITE_URL
    if (import.meta.env.VITE_SITE_URL) return import.meta.env.VITE_SITE_URL
    if (env.VERCEL_URL) return `https://${env.VERCEL_URL}`

    return `http://localhost:${env.PORT ?? "3000"}`
}

/** Identity type for the client service; `Self` has no inference site. */
export interface CorehallaClientSelf {
    readonly _: unique symbol
}

/**
 * Typed Effect HTTP client for the app, exposed as atoms.
 *
 * In the browser it calls the mounted `/api/effect/*` routes with
 * `FetchHttpClient` and relative URLs.
 */
export const CorehallaClient = AtomHttpApi.Service<CorehallaClientSelf>()(
    "CorehallaClient",
    {
        api: CorehallaApi,
        httpClient: FetchHttpClient.layer,
        // Retry transient failures (network errors, 429s, 5xx) with
        // exponential backoff for every query atom.
        transformClient: withRetry,
        baseUrl: import.meta.env.SSR ? serverOrigin() : undefined,
    },
)
