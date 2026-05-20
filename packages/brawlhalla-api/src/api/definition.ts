import { Schema } from "effect"
import { HttpApi, HttpApiEndpoint, HttpApiGroup } from "effect/unstable/httpapi"

import { RankedRegionParamSchema } from "../constants/ranked/regions.js"
import { Clan } from "../schema/clan.js"
import { Legend, Legends } from "../schema/legends.js"
import { PlayerRanked } from "../schema/player-ranked.js"
import { PlayerStats } from "../schema/player-stats.js"
import {
    Rankings1v1,
    Rankings2v2,
    RankingsRotating,
} from "../schema/rankings.js"
import { SearchBySteamId } from "../schema/search.js"
import { ApiKeyMiddleware } from "./middleware.js"

export const BRAWLHALLA_API_BASE_URL = "https://api.brawlhalla.com"

export const BrawlhallaApi = HttpApi.make("BrawlhallaApi")
    .add(
        HttpApiGroup.make("player").add(
            HttpApiEndpoint.get("stats", "/player/:playerId/stats", {
                params: {
                    playerId: Schema.NumberFromString,
                },
                success: PlayerStats,
            }),
            HttpApiEndpoint.get("ranked", "/player/:playerId/ranked", {
                params: {
                    playerId: Schema.NumberFromString,
                },
                success: PlayerRanked,
            }),
        ),
        HttpApiGroup.make("clan").add(
            HttpApiEndpoint.get("get", "/clan/:clanId", {
                params: {
                    clanId: Schema.NumberFromString,
                },
                success: Clan,
            }),
        ),
        HttpApiGroup.make("rankings").add(
            HttpApiEndpoint.get("oneVOne", "/rankings/1v1/:region/:page", {
                params: {
                    region: RankedRegionParamSchema,
                    page: Schema.NumberFromString,
                },
                query: {
                    name: Schema.optionalKey(Schema.String),
                },
                success: Rankings1v1,
            }),
            HttpApiEndpoint.get("twoVTwo", "/rankings/2v2/:region/:page", {
                params: {
                    region: RankedRegionParamSchema,
                    page: Schema.NumberFromString,
                },
                success: Rankings2v2,
            }),
            HttpApiEndpoint.get(
                "rotating",
                "/rankings/rotating/:region/:page",
                {
                    params: {
                        region: RankedRegionParamSchema,
                        page: Schema.NumberFromString,
                    },
                    success: RankingsRotating,
                },
            ),
        ),
        HttpApiGroup.make("search").add(
            HttpApiEndpoint.get("bySteamId", "/search", {
                query: {
                    steamid: Schema.String,
                },
                success: SearchBySteamId,
            }),
        ),
        HttpApiGroup.make("legend").add(
            HttpApiEndpoint.get("all", "/legend/all", {
                success: Legends,
            }),
            HttpApiEndpoint.get("get", "/legend/:legendId", {
                params: {
                    legendId: Schema.NumberFromString,
                },
                success: Legend,
            }),
        ),
    )
    .middleware(ApiKeyMiddleware)
