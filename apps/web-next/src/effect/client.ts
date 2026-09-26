import { AtomHttpApi } from "effect/unstable/reactivity"
import { FetchHttpClient } from "effect/unstable/http"
import { CorehallaApi } from "@crh/api-contract/Api"

/**
 * Where the API answers, supplied by the deployment as `VITE_API_ORIGIN`.
 *
 * There is deliberately **no fallback**. The origin belongs to whoever deployed
 * the app: under `alchemy dev` it is the API worker's own resolved URL, and in
 * production it is the API's public URL. A literal here would be a guess that
 * silently points somewhere wrong the moment the API moves, and the symptom
 * would be an empty page rather than an error.
 *
 * An empty value leaves requests relative, which is the right shape for a
 * same-origin deployment and simply finds nothing when there is nothing there.
 * Both the browser and the server render use this one value, so there is no
 * second path that could disagree with it.
 */
const apiOrigin = import.meta.env["VITE_API_ORIGIN"] ?? ""

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
        // Applied to the browser as well as the server. It used to be
        // server-only, because the browser reached the API through the dev
        // server's proxy on a relative path; with the proxy gone a relative call
        // would hit this app's own origin and 404. An empty origin still means
        // relative, which is right for a same-origin deployment.
        baseUrl: apiOrigin === "" ? undefined : apiOrigin,
    },
)
