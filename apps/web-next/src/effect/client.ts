import { Layer } from "effect"
import { AtomHttpApi } from "effect/unstable/reactivity"
import { FetchHttpClient, HttpClient } from "effect/unstable/http"
import { CorehallaApi } from "@crh/api-contract/Api"

/**
 * Typed Effect HTTP client for the app, exposed as atoms.
 *
 * The same `AtomHttpApi` the current app uses, so every interaction here is
 * built against the real contract rather than a mock — the point of the study is
 * to find out whether the UX works, and that depends on the real shapes.
 *
 * ## No API origin
 *
 * Every request uses a relative `/api/v1/*` path, so the browser calls its own
 * origin and the server render is handed a client that talks to the API worker
 * over its service binding. Both paths end up inside Cloudflare.
 *
 * This replaced a configured absolute origin, which had a failure mode rather
 * than just being untidy: under `alchemy dev` the API's port is assigned per run,
 * so a build-time value goes stale and the app starts calling whatever now
 * occupies that port. That surfaces as a CORS error in the browser and a decode
 * error on the server, and neither points at the real cause.
 */

/** Identity type for the client service; `Self` has no inference site. */
export interface CorehallaClientSelf {
    readonly _: unique symbol
}

let serverClient: HttpClient.HttpClient | undefined

/**
 * Server-only: install the client that reaches the API over its binding.
 *
 * Called once by the server entry (`src/server.ts`), which is the only place the
 * binding can be resolved.
 */
export const useServerHttpClient = (client: HttpClient.HttpClient): void => {
    serverClient = client
}

/**
 * Deferred so the server entry has installed the client before the atom runtime
 * builds its layer — the layer is built on first use, not at import time. Falls
 * back to `fetch` (and therefore relative URLs) if nothing was installed, which
 * fails visibly rather than silently reaching the wrong place.
 */
const serverHttpClient = Layer.suspend(() =>
    serverClient !== undefined
        ? Layer.succeed(HttpClient.HttpClient)(serverClient)
        : FetchHttpClient.layer,
)

export const CorehallaClient = AtomHttpApi.Service<CorehallaClientSelf>()(
    "CorehallaClient",
    {
        api: CorehallaApi,
        httpClient: import.meta.env.SSR
            ? serverHttpClient
            : FetchHttpClient.layer,
    },
)
