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
    Ladder,
    LookupResultsSchema,
    Player3v3RankedSchema,
    PlayerAliasesSchema,
    PlayerRankedSchema,
    PlayerStatsSchema,
    PowerRankingsRegion,
    PowerRankingsSchema,
    RankedRegion,
    Ranking1v1Schema,
    Ranking2v2Schema,
    RankedQueueSchema,
    Ranking3v3Schema,
    SortablePlayerProp,
    SortableLegendProp,
    SortableWeaponProp,
    Weapon,
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
        HttpApiEndpoint.get("get1v1Rankings", "/api/v1/rankings/1v1", {
            query: {
                region: RankedRegion,
                page: Schema.FiniteFromString,
                name: Schema.optionalKey(Schema.String),
            },
            success: Ranking1v1Schema,
        }),
    )
    .add(
        HttpApiEndpoint.get("get2v2Rankings", "/api/v1/rankings/2v2", {
            query: {
                region: RankedRegion,
                page: Schema.FiniteFromString,
            },
            success: Ranking2v2Schema,
        }),

        /**
         * The 3v3 ladder. v1-only: the legacy API has no 3v3 mode, so there is
         * no fallback source for it.
         */
        HttpApiEndpoint.get("get3v3Rankings", "/api/v1/rankings/3v3", {
            query: {
                region: RankedRegion,
                page: Schema.FiniteFromString,
            },
            success: Ranking3v3Schema,
        }),
    )
    .add(
        HttpApiEndpoint.get(
            "getGlobalPlayerRankings",
            "/api/v1/rankings/global",
            {
                query: {
                    sortBy: SortablePlayerProp,
                    page: Schema.FiniteFromString,
                },
                success: GlobalPlayerRankingsSchema,
            },
        ),
    )
    /*
     * The two boards that rank a player *within one legend or weapon*.
     *
     * They return the same row shape as the global board — a player and one
     * number — because that is genuinely all they are; what differs is the
     * filter and the column, both of which are query parameters rather than
     * fields. A row carries no legend or weapon, because every row on a given
     * board has the same one and the caller supplied it.
     */
    .add(
        HttpApiEndpoint.get(
            "getGlobalLegendRankings",
            "/api/v1/rankings/legends",
            {
                query: {
                    legendId: Schema.FiniteFromString,
                    sortBy: SortableLegendProp,
                    page: Schema.FiniteFromString,
                },
                success: GlobalPlayerRankingsSchema,
            },
        ),
    )
    .add(
        HttpApiEndpoint.get(
            "getGlobalWeaponRankings",
            "/api/v1/rankings/weapons",
            {
                query: {
                    weapon: Weapon,
                    sortBy: SortableWeaponProp,
                    page: Schema.FiniteFromString,
                },
                success: GlobalPlayerRankingsSchema,
            },
        ),
    )
    .add(
        /**
         * Who is playing right now.
         *
         * Not a ranking: the rows are the players whose game count rose since
         * the last sample of that ladder, so membership expires on its own. It
         * shares the rankings group because it is addressed the same way — one
         * bracket crossed with one region.
         */
        HttpApiEndpoint.get("getRankedQueue", "/api/v1/rankings/queue", {
            query: {
                bracket: Ladder,
                region: RankedRegion,
            },
            success: RankedQueueSchema,
        }),
    )
    .add(
        HttpApiEndpoint.get("getClansRankings", "/api/v1/rankings/clans", {
            query: {
                name: Schema.String,
                page: Schema.FiniteFromString,
            },
            success: ClansSchema,
        }),
    )
    .add(
        HttpApiEndpoint.get("getPowerRankings", "/api/v1/rankings/power", {
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
            "/api/v1/stats/player/:playerId/stats",
            {
                params: { playerId: Schema.FiniteFromString },
                success: Schema.NullOr(PlayerStatsSchema),
            },
        ),
    )
    .add(
        HttpApiEndpoint.get(
            "getPlayerRanked",
            "/api/v1/stats/player/:playerId/ranked",
            {
                params: { playerId: Schema.FiniteFromString },
                // A player without ranked games is a valid, empty result.
                success: Schema.NullOr(PlayerRankedSchema),
            },
        ),
    )
    .add(
        /**
         * The player's 3v3 ranked record.
         *
         * Its own endpoint rather than a field on `getPlayerRanked`, because
         * the two come from different upstreams: `getPlayerRanked` is v0-only
         * (which has no 3v3 mode) and this is v1-only (which has no 2v2 mode).
         * Neither can answer for the other, so a client that wants both makes
         * both calls, and a client that wants only 1v1 pays for neither.
         */
        HttpApiEndpoint.get(
            "getPlayer3v3Ranked",
            "/api/v1/stats/player/:playerId/ranked-3v3",
            {
                params: { playerId: Schema.FiniteFromString },
                // Most players have never queued 3v3, so "no record" is an
                // ordinary result rather than a 404.
                success: Schema.NullOr(Player3v3RankedSchema),
            },
        ),
    )
    .add(
        HttpApiEndpoint.get(
            "getPlayerAliases",
            "/api/v1/stats/player/:playerId/aliases",
            {
                params: { playerId: Schema.FiniteFromString },
                success: PlayerAliasesSchema,
            },
        ),
    )
    .add(
        HttpApiEndpoint.get("getClanStats", "/api/v1/stats/clan/:clanId", {
            params: { clanId: Schema.FiniteFromString },
            success: Schema.NullOr(ClanSchema),
        }),
    )

const search = HttpApiGroup.make("search")
    .add(
        HttpApiEndpoint.get("searchPlayerAlias", "/api/v1/search/players", {
            query: {
                alias: Schema.String,
                page: Schema.FiniteFromString,
            },
            success: AliasSearchResultsSchema,
        }),
    )
    .add(
        /**
         * The federated lookup: players and clans in one ranked list.
         *
         * Separate from `searchPlayerAlias`, which exposes the raw local alias
         * index. This is the product surface — it merges the upstream ladder
         * search with the local alias and clan indexes, then ranks the result.
         */
        HttpApiEndpoint.get("lookup", "/api/v1/search", {
            query: {
                q: Schema.String,
                limit: Schema.optionalKey(Schema.FiniteFromString),
            },
            success: LookupResultsSchema,
        }),
    )

const content = HttpApiGroup.make("content")
    .add(
        HttpApiEndpoint.get(
            "getWeeklyRotation",
            "/api/v1/content/weekly-rotation",
            { success: WeeklyRotationSchema },
        ),
    )
    .add(
        HttpApiEndpoint.get("getBHArticles", "/api/v1/content/articles", {
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
