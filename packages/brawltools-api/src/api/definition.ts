import { Schema } from "effect"
import { HttpApi, HttpApiEndpoint, HttpApiGroup } from "effect/unstable/httpapi"

import { PowerRankingsOrderBySchema } from "../constants/order-by.js"
import { PowerRankingsRegionParamSchema } from "../constants/regions.js"
import { PowerRankingsResponse } from "../schema/power-rankings.js"
import {
    OneVOneGameModeMiddleware,
    TwoVTwoGameModeMiddleware,
} from "./middleware.js"

export const BRAWLTOOLS_API_BASE_URL = "https://api.brawltools.com/v2"

const powerRankingsQuery = {
    region: PowerRankingsRegionParamSchema,
    page: Schema.NumberFromString,
    orderBy: PowerRankingsOrderBySchema,
    query: Schema.optionalKey(Schema.String),
    maxResults: Schema.optionalKey(Schema.NumberFromString),
}

export const BrawltoolsApi = HttpApi.make("BrawltoolsApi").add(
    HttpApiGroup.make("powerRankings").add(
        HttpApiEndpoint.get("oneVOne", "/pr", {
            query: powerRankingsQuery,
            success: PowerRankingsResponse,
        }).middleware(OneVOneGameModeMiddleware),
        HttpApiEndpoint.get("twoVTwo", "/pr", {
            query: powerRankingsQuery,
            success: PowerRankingsResponse,
        }).middleware(TwoVTwoGameModeMiddleware),
    ),
)
