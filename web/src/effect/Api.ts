import { HttpApi, HttpApiEndpoint, HttpApiGroup } from "effect/unstable/httpapi"
import { Schema } from "effect"
import {
    AliasSearchResultsSchema,
    ArticleCategory,
    ArticlesSchema,
    Bracket,
    ClanSchema,
    ClansSchema,
    GlobalPlayerRankingsSchema,
    PlayerAliasesSchema,
    PlayerRankedSchema,
    PlayerStatsSchema,
    PowerRankingsRegion,
    PowerRankingsSchema,
    RankedRegion,
    Ranking1v1Schema,
    Ranking2v2Schema,
    SortablePlayerProp,
    WeeklyRotationSchema,
} from "./schemas"

/**
 * The typed HTTP contract that replaces the tRPC router for the Start app.
 *
 * Endpoints mirror the previous tRPC procedures. They are grouped so both the
 * Effect server handlers and the `AtomHttpApi` client can address them by
 * `(group, endpoint)`.
 */

const rankings = HttpApiGroup.make("rankings")
    .add(
        HttpApiEndpoint.get("get1v1Rankings", "/api/effect/rankings/1v1", {
            query: {
                region: RankedRegion,
                page: Schema.FiniteFromString,
                name: Schema.optionalKey(Schema.String),
            },
            success: Ranking1v1Schema,
        }),
    )
    .add(
        HttpApiEndpoint.get("get2v2Rankings", "/api/effect/rankings/2v2", {
            query: {
                region: RankedRegion,
                page: Schema.FiniteFromString,
            },
            success: Ranking2v2Schema,
        }),
    )
    .add(
        HttpApiEndpoint.get(
            "getGlobalPlayerRankings",
            "/api/effect/rankings/global",
            {
                query: {
                    sortBy: SortablePlayerProp,
                    page: Schema.FiniteFromString,
                },
                success: GlobalPlayerRankingsSchema,
            },
        ),
    )
    .add(
        HttpApiEndpoint.get("getClansRankings", "/api/effect/rankings/clans", {
            query: {
                name: Schema.String,
                page: Schema.FiniteFromString,
            },
            success: ClansSchema,
        }),
    )
    .add(
        HttpApiEndpoint.get("getPowerRankings", "/api/effect/rankings/power", {
            query: {
                bracket: Bracket,
                region: PowerRankingsRegion,
            },
            success: PowerRankingsSchema,
        }),
    )

const stats = HttpApiGroup.make("stats")
    .add(
        HttpApiEndpoint.get(
            "getPlayerStats",
            "/api/effect/stats/player/:playerId/stats",
            {
                params: { playerId: Schema.FiniteFromString },
                success: Schema.NullOr(PlayerStatsSchema),
            },
        ),
    )
    .add(
        HttpApiEndpoint.get(
            "getPlayerRanked",
            "/api/effect/stats/player/:playerId/ranked",
            {
                params: { playerId: Schema.FiniteFromString },
                // A player without ranked games is a valid, empty result.
                success: Schema.NullOr(PlayerRankedSchema),
            },
        ),
    )
    .add(
        HttpApiEndpoint.get(
            "getPlayerAliases",
            "/api/effect/stats/player/:playerId/aliases",
            {
                params: { playerId: Schema.FiniteFromString },
                success: PlayerAliasesSchema,
            },
        ),
    )
    .add(
        HttpApiEndpoint.get("getClanStats", "/api/effect/stats/clan/:clanId", {
            params: { clanId: Schema.FiniteFromString },
            success: Schema.NullOr(ClanSchema),
        }),
    )

const search = HttpApiGroup.make("search").add(
    HttpApiEndpoint.get("searchPlayerAlias", "/api/effect/search/players", {
        query: {
            alias: Schema.String,
            page: Schema.FiniteFromString,
        },
        success: AliasSearchResultsSchema,
    }),
)

const content = HttpApiGroup.make("content")
    .add(
        HttpApiEndpoint.get(
            "getWeeklyRotation",
            "/api/effect/content/weekly-rotation",
            { success: WeeklyRotationSchema },
        ),
    )
    .add(
        HttpApiEndpoint.get("getBHArticles", "/api/effect/content/articles", {
            query: {
                category: Schema.optionalKey(ArticleCategory),
                first: Schema.optionalKey(Schema.FiniteFromString),
            },
            success: ArticlesSchema,
        }),
    )

export const CorehallaApi = HttpApi.make("CorehallaApi")
    .add(rankings)
    .add(stats)
    .add(search)
    .add(content)

export type CorehallaApi = typeof CorehallaApi
