import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Redacted from "effect/Redacted"
import { FetchHttpClient, HttpClientRequest } from "effect/unstable/http"
import { HttpApiClient, HttpApiMiddleware } from "effect/unstable/httpapi"

import { BrawlhallaApiConfig } from "./config.js"
import { BrawlhallaApi, BRAWLHALLA_API_BASE_URL } from "./definition.js"
import { ApiKeyMiddleware } from "./middleware.js"

export type BrawlhallaApiClient = HttpApiClient.ForApi<typeof BrawlhallaApi>

export class BrawlhallaApiClientService extends Context.Service<
    BrawlhallaApiClientService,
    BrawlhallaApiClient
>()("BrawlhallaApiClient") {}

const apiKeyMiddlewareLayer = (apiKey: string) =>
    HttpApiMiddleware.layerClient(ApiKeyMiddleware, ({ next, request }) =>
        next(HttpClientRequest.setUrlParam(request, "api_key", apiKey)),
    )

export const layerBrawlhallaApiClient = (config: {
    readonly apiKey: Redacted.Redacted<string>
    readonly baseUrl?: string | undefined
}) => {
    const baseUrl = config.baseUrl ?? BRAWLHALLA_API_BASE_URL
    const apiKey = Redacted.value(config.apiKey)

    return Layer.effect(
        BrawlhallaApiClientService,
        HttpApiClient.make(BrawlhallaApi, { baseUrl }),
    ).pipe(
        Layer.provide(
            Layer.mergeAll(
                Layer.succeed(BrawlhallaApiConfig, {
                    apiKey: config.apiKey,
                    baseUrl,
                }),
                FetchHttpClient.layer,
                apiKeyMiddlewareLayer(apiKey),
            ),
        ),
    )
}

export const makeBrawlhallaApiClient = (config: {
    readonly apiKey: Redacted.Redacted<string>
    readonly baseUrl?: string | undefined
}) =>
    HttpApiClient.make(BrawlhallaApi, {
        baseUrl: config.baseUrl ?? BRAWLHALLA_API_BASE_URL,
    }).pipe(
        Effect.provide(apiKeyMiddlewareLayer(Redacted.value(config.apiKey))),
        Effect.provide(FetchHttpClient.layer),
    )
