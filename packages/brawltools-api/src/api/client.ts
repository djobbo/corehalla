import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import { FetchHttpClient } from "effect/unstable/http"
import { HttpApiClient, HttpApiMiddleware } from "effect/unstable/httpapi"

import { powerRankingsGameModeWire } from "../constants/game-mode.js"
import { BrawltoolsApiConfig } from "./config.js"
import { BrawltoolsApi, BRAWLTOOLS_API_BASE_URL } from "./definition.js"
import {
    formatPowerRankingsRequest,
    OneVOneGameModeMiddleware,
    TwoVTwoGameModeMiddleware,
} from "./middleware.js"

export type BrawltoolsApiClient = HttpApiClient.ForApi<typeof BrawltoolsApi>

export class BrawltoolsApiClientService extends Context.Service<
    BrawltoolsApiClientService,
    BrawltoolsApiClient
>()("BrawltoolsApiClient") {}

const oneVOneGameModeMiddlewareLayer = (maxResults: number) =>
    HttpApiMiddleware.layerClient(
        OneVOneGameModeMiddleware,
        ({ next, request }) =>
            next(
                formatPowerRankingsRequest(
                    request,
                    powerRankingsGameModeWire["1v1"],
                    maxResults,
                ),
            ),
    )

const twoVTwoGameModeMiddlewareLayer = (maxResults: number) =>
    HttpApiMiddleware.layerClient(
        TwoVTwoGameModeMiddleware,
        ({ next, request }) =>
            next(
                formatPowerRankingsRequest(
                    request,
                    powerRankingsGameModeWire["2v2"],
                    maxResults,
                ),
            ),
    )

export const layerBrawltoolsApiClient = (config?: {
    readonly baseUrl?: string | undefined
    readonly maxResults?: number | undefined
}) => {
    const baseUrl = config?.baseUrl ?? BRAWLTOOLS_API_BASE_URL
    const maxResults =
        config?.maxResults ?? BrawltoolsApiConfig.defaultMaxResults

    return Layer.effect(
        BrawltoolsApiClientService,
        HttpApiClient.make(BrawltoolsApi, { baseUrl }),
    ).pipe(
        Layer.provide(
            Layer.mergeAll(
                Layer.succeed(BrawltoolsApiConfig, { baseUrl, maxResults }),
                FetchHttpClient.layer,
                oneVOneGameModeMiddlewareLayer(maxResults),
                twoVTwoGameModeMiddlewareLayer(maxResults),
            ),
        ),
    )
}

export const makeBrawltoolsApiClient = (config?: {
    readonly baseUrl?: string | undefined
    readonly maxResults?: number | undefined
}) => {
    const maxResults =
        config?.maxResults ?? BrawltoolsApiConfig.defaultMaxResults

    return HttpApiClient.make(BrawltoolsApi, {
        baseUrl: config?.baseUrl ?? BRAWLTOOLS_API_BASE_URL,
    }).pipe(
        Effect.provide(oneVOneGameModeMiddlewareLayer(maxResults)),
        Effect.provide(twoVTwoGameModeMiddlewareLayer(maxResults)),
        Effect.provide(FetchHttpClient.layer),
    )
}
