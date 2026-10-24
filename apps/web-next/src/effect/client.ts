import { Layer } from "effect"
import { AtomHttpApi } from "effect/reactivity"
import { FetchHttpClient, HttpClient } from "effect/http"
import { CorehallaApi } from "@crh/api-contract/Api"
import { withRetry } from "./retry"
import { withContract } from "./contract"

/** Identity type for the client service; `Self` has no inference site. */
export interface CorehallaClientSelf {
    readonly _: unique symbol
}

let serverClient: HttpClient.HttpClient | undefined

export const useServerHttpClient = (client: HttpClient.HttpClient): void => {
    serverClient = client
}

// Deferred so server entry can install the client before first layer build.
const serverHttpClient = Layer.suspend(() =>
    serverClient !== undefined
        ? Layer.succeed(HttpClient.HttpClient)(serverClient)
        : FetchHttpClient.layer,
)

// Absolute so toWeb can build a Request; host never resolves — nothing dials it.
const SERVER_BASE_URL = "http://api.internal"

export const CorehallaClient = AtomHttpApi.Service<CorehallaClientSelf>()(
    "CorehallaClient",
    {
        api: CorehallaApi,
        httpClient: import.meta.env.SSR
            ? serverHttpClient
            : FetchHttpClient.layer,
        transformClient: (client) => withContract(withRetry(client)),
        // Browser stays relative; only the render needs an absolute URL to parse.
        baseUrl: import.meta.env.SSR ? SERVER_BASE_URL : undefined,
    },
)
