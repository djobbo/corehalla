import { AtomHttpApi } from "effect/unstable/reactivity"
import { FetchHttpClient } from "effect/unstable/http"
import { CorehallaApi } from "@crh/api-contract/Api"

/**
 * Where the API actually answers, for the **server** render.
 *
 * The browser uses relative `/api/v1/*` paths, which the dev server proxies to
 * the same origin (see `vite.config.ts`); `fetch` cannot resolve a relative URL
 * on the server, so SSR needs this absolute form.
 */
const apiOrigin = import.meta.env["VITE_API_ORIGIN"] ?? "http://localhost:1338"

/** Identity type for the client service; `Self` has no inference site. */
export interface CorehallaClientSelf {
    readonly _: unique symbol
}

/**
 * Typed Effect HTTP client for the app, exposed as atoms.
 *
 * The same `AtomHttpApi` the current app uses, so every interaction here is
 * built against the real contract rather than a mock — the point of the study is
 * to find out whether the UX works, and that depends on the real shapes.
 */
export const CorehallaClient = AtomHttpApi.Service<CorehallaClientSelf>()(
    "CorehallaClient",
    {
        api: CorehallaApi,
        httpClient: FetchHttpClient.layer,
        baseUrl: import.meta.env.SSR ? apiOrigin : undefined,
    },
)
