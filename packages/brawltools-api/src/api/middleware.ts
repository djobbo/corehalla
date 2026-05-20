import * as Option from "effect/Option"
import { HttpClientRequest, UrlParams } from "effect/unstable/http"
import { HttpApiMiddleware } from "effect/unstable/httpapi"

import type { powerRankingsGameModeWire } from "../constants/game-mode.js"
import type { PowerRankingsOrderBy } from "../constants/order-by.js"
import {
    formatPowerRankingsOrderByWire,
    powerRankingsOrderBy,
} from "../constants/order-by.js"

const isPowerRankingsOrderBy = (value: string): value is PowerRankingsOrderBy =>
    (powerRankingsOrderBy as readonly string[]).includes(value)

export const formatPowerRankingsRequest = (
    request: HttpClientRequest.HttpClientRequest,
    gameMode: (typeof powerRankingsGameModeWire)[keyof typeof powerRankingsGameModeWire],
    maxResults: number,
): HttpClientRequest.HttpClientRequest => {
    const rawOrderBy = Option.getOrElse(
        UrlParams.getFirst(request.urlParams, "orderBy"),
        () => "powerRanking",
    )
    const orderBy = isPowerRankingsOrderBy(rawOrderBy)
        ? rawOrderBy
        : "powerRanking"

    let next = HttpClientRequest.setUrlParam(
        request,
        "orderBy",
        formatPowerRankingsOrderByWire(orderBy),
    )
    next = HttpClientRequest.setUrlParam(next, "gameMode", gameMode)

    if (Option.isNone(UrlParams.getFirst(next.urlParams, "maxResults"))) {
        next = HttpClientRequest.setUrlParam(
            next,
            "maxResults",
            String(maxResults),
        )
    }

    return next
}

export class OneVOneGameModeMiddleware extends HttpApiMiddleware.Service<OneVOneGameModeMiddleware>()(
    "BrawltoolsApi/OneVOneGameMode",
    { requiredForClient: true },
) {}

export class TwoVTwoGameModeMiddleware extends HttpApiMiddleware.Service<TwoVTwoGameModeMiddleware>()(
    "BrawltoolsApi/TwoVTwoGameMode",
    { requiredForClient: true },
) {}
