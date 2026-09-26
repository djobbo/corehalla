import { Layer } from "effect"
import { AtomHttpApi } from "effect/unstable/reactivity"
import { FetchHttpClient, HttpClient } from "effect/unstable/http"
import { CorehallaApi } from "./Api"
import { withRetry } from "./retry"

/**
 * Origin used by the **fallback** server-side client.
 *
 * Route loaders preload atoms on the server, and the atoms call the mounted
 * `/api/effect/*` routes. The default server-side client calls the handler
 * in-process (see `useInProcessHttpClient`), which needs no origin; this is only
 * used if that client was never installed, where the request still has to be
 * absolute because `fetch` cannot resolve a relative URL on the server.
 */
const serverOrigin = () => {
    const env = globalThis.process?.env ?? {}

    if (env.INTERNAL_ORIGIN) return env.INTERNAL_ORIGIN
    if (env.SITE_URL) return env.SITE_URL
    if (import.meta.env.VITE_SITE_URL) return import.meta.env.VITE_SITE_URL
    if (env.VERCEL_URL) return `https://${env.VERCEL_URL}`

    return `http://localhost:${env.PORT ?? "3000"}`
}

let inProcessClient: HttpClient.HttpClient | undefined

/**
 * Server-only: load SSR data by calling the API handler in the same isolate.
 *
 * Installed once by the server entry (`src/server.ts`). Fetching this
 * deployment over its own public origin is both awkward (the request needs an
 * absolute URL) and fragile: the zone's bot protection answers a managed
 * challenge (`cf-mitigated: challenge`, 403) to the Worker's own subrequest, so
 * every server-rendered first load failed with a decode error while client-side
 * navigation kept working.
 */
export const useInProcessHttpClient = (client: HttpClient.HttpClient): void => {
    inProcessClient = client
}

/**
 * Deferred so the server entry has installed the client before the atom runtime
 * builds its layer — the layer is built on first use, not at import time.
 */
const serverHttpClient = Layer.suspend(() =>
    inProcessClient !== undefined
        ? Layer.succeed(HttpClient.HttpClient)(inProcessClient)
        : FetchHttpClient.layer,
)

/** Identity type for the client service; `Self` has no inference site. */
export interface CorehallaClientSelf {
    readonly _: unique symbol
}

/**
 * Typed Effect HTTP client for the app, exposed as atoms.
 *
 * In the browser it calls the mounted `/api/effect/*` routes with
 * `FetchHttpClient` and relative URLs; on the server it resolves to whatever
 * `useInProcessHttpClient` installed.
 */
export const CorehallaClient = AtomHttpApi.Service<CorehallaClientSelf>()(
    "CorehallaClient",
    {
        api: CorehallaApi,
        httpClient: import.meta.env.SSR
            ? serverHttpClient
            : FetchHttpClient.layer,
        // Retry transient failures (network errors, 429s, 5xx) with
        // exponential backoff for every query atom.
        transformClient: withRetry,
        baseUrl: import.meta.env.SSR ? serverOrigin() : undefined,
    },
)
