import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import { FetchHttpClient } from "effect/unstable/http"
import { HttpApiClient } from "effect/unstable/httpapi"

import { BrawlhallaGqlApiConfig } from "./config.js"
import { BrawlhallaGqlApi, BRAWLHALLA_GQL_BASE_URL } from "./definition.js"
import {
    layerArticlesListQueryMiddleware,
    layerArticlesPreviewQueryMiddleware,
    layerArticlesWithContentQueryMiddleware,
} from "./middleware.js"

export type BrawlhallaGqlApiClient = HttpApiClient.ForApi<
    typeof BrawlhallaGqlApi
>

export class BrawlhallaGqlApiClientService extends Context.Service<
    BrawlhallaGqlApiClientService,
    BrawlhallaGqlApiClient
>()("BrawlhallaGqlApiClient") {}

export const layerBrawlhallaGqlApiClient = (config?: {
    readonly baseUrl?: string | undefined
}) => {
    const baseUrl = config?.baseUrl ?? BRAWLHALLA_GQL_BASE_URL

    return Layer.effect(
        BrawlhallaGqlApiClientService,
        HttpApiClient.make(BrawlhallaGqlApi, { baseUrl }),
    ).pipe(
        Layer.provide(
            Layer.mergeAll(
                Layer.succeed(BrawlhallaGqlApiConfig, { baseUrl }),
                FetchHttpClient.layer,
                layerArticlesListQueryMiddleware,
                layerArticlesWithContentQueryMiddleware,
                layerArticlesPreviewQueryMiddleware,
            ),
        ),
    )
}

export const makeBrawlhallaGqlApiClient = (config?: {
    readonly baseUrl?: string | undefined
}) =>
    HttpApiClient.make(BrawlhallaGqlApi, {
        baseUrl: config?.baseUrl ?? BRAWLHALLA_GQL_BASE_URL,
    }).pipe(
        Effect.provide(layerArticlesListQueryMiddleware),
        Effect.provide(layerArticlesWithContentQueryMiddleware),
        Effect.provide(layerArticlesPreviewQueryMiddleware),
        Effect.provide(FetchHttpClient.layer),
    )
