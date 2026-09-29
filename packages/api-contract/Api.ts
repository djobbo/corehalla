import {
    HttpApi,
    HttpApiEndpoint,
    HttpApiError,
    HttpApiGroup,
    HttpApiSchema,
} from "effect/unstable/httpapi"
import { Schema } from "effect"
import {
    AliasSearchResultsSchema,
    ArticleCategory,
    ArticlesSchema,
    Bracket,
    CareerRankingsSchema,
    ClanSchema,
    ClansSchema,
    ConnectionSchema,
    FavoriteInputSchema,
    FavoriteSchema,
    GuildEnvelopeSchema,
    Ladder,
    LookupResultsSchema,
    Player3v3RankedSchema,
    PlayerAliasesSchema,
    PlayerEnvelopeSchema,
    PlayerRankedSchema,
    PlayerStatsSchema,
    PowerRankingsRegion,
    PowerRankingsSchema,
    RankedQueueSchema,
    RankedRegion,
    Ranking1v1Schema,
    Ranking2v2Schema,
    Rankings1v1EnvelopeSchema,
    Rankings2v2EnvelopeSchema,
    Rankings3v3EnvelopeSchema,
    Ranking3v3Schema,
    SessionSchema,
    SortablePlayerProp,
    SortableLegendProp,
    SortableWeaponProp,
    Weapon,
    WeeklyRotationSchema,
} from "./schemas"

/**
 * The typed HTTP contract for the Corehalla API.
 *
 * ## Layout
 *
 * | Group | Serves | Shape |
 * | --- | --- | --- |
 * | `players` | `/api/v1/players/:id` | one aggregate for the whole profile page |
 * | `guilds` | `/api/v1/guilds/:id` | one aggregate for the whole guild page |
 * | `rankings` | `/api/v1/rankings/*` | the live ladders, presentation-ready, plus our own career boards |
 * | `search` | `/api/v1/search*` | the federated lookup and the alias index |
 * | `content` | `/api/v1/content/*` | scraped site content |
 * | `me`, `auth` | `/api/v1/me/*`, `/api/v1/auth/*` | app-owned accounts |
 * | `upstream` | `/api/v1/upstream/brawlhalla/*` | Brawlhalla v1/v0, verbatim |
 *
 * The split that matters is the last row. Everything above it is a product
 * endpoint: it aggregates, derives, and answers a page in one request. The
 * `upstream` group is the old pass-through surface, kept because it is a real
 * debugging and parity tool — when an aggregate looks wrong, the way to tell
 * whether the bug is ours or Brawlhalla's is to ask for the raw payload beside
 * it.
 *
 * Group ids are part of the client's vocabulary (`CorehallaClient.query(group,
 * endpoint)`), so renaming one is a source-level break even when the URL is
 * unchanged.
 */

const players = HttpApiGroup.make("players").add(
    HttpApiEndpoint.get("getPlayer", "/api/v1/players/:playerId", {
        params: { playerId: Schema.FiniteFromString },
        success: PlayerEnvelopeSchema,
        // A player nobody has heard of is a 404 rather than an empty payload:
        // the page cannot render without stats, and "no such player" is what
        // that means.
        error: HttpApiError.NotFound,
    }),
)

const guilds = HttpApiGroup.make("guilds").add(
    HttpApiEndpoint.get("getGuild", "/api/v1/guilds/:guildId", {
        params: { guildId: Schema.FiniteFromString },
        success: GuildEnvelopeSchema,
        error: HttpApiError.NotFound,
    }),
)

const rankings = HttpApiGroup.make("rankings")
    .add(
        /**
         * The 1v1 ladder.
         *
         * `name` is an upstream filter rather than a local one: v1 accepts it,
         * so a named search is one request against the whole ladder instead of
         * a page scan.
         */
        HttpApiEndpoint.get("getRanked1v1", "/api/v1/rankings/1v1", {
            query: {
                region: RankedRegion,
                page: Schema.FiniteFromString,
                name: Schema.optionalKey(Schema.String),
            },
            success: Rankings1v1EnvelopeSchema,
        }),
    )
    .add(
        HttpApiEndpoint.get("getRanked2v2", "/api/v1/rankings/2v2", {
            query: {
                region: RankedRegion,
                page: Schema.FiniteFromString,
            },
            success: Rankings2v2EnvelopeSchema,
        }),
    )
    .add(
        /**
         * The 3v3 ladder. v1-only: the legacy API has no 3v3 mode, so there is
         * no fallback source for it.
         */
        HttpApiEndpoint.get("getRanked3v3", "/api/v1/rankings/3v3", {
            query: {
                region: RankedRegion,
                page: Schema.FiniteFromString,
            },
            success: Rankings3v3EnvelopeSchema,
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
                success: CareerRankingsSchema,
            },
        ),
    )
    /*
     * The two boards that rank a player *within one legend or weapon*.
     *
     * They return the same row shape as the career board — a player and one
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
                success: CareerRankingsSchema,
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
                success: CareerRankingsSchema,
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

/**
 * The signed-in user's own data.
 *
 * These are the first endpoints on this worker that are not public: they read
 * the app session cookie and scope every query to that session's user. They are
 * grouped apart from the ladders because their results must never be
 * shared-cached, and because a caller that is not signed in gets a 401 rather
 * than an empty board.
 */
const me = HttpApiGroup.make("me")
    .add(
        HttpApiEndpoint.get("getSession", "/api/v1/me/session", {
            success: SessionSchema,
        }),
    )
    .add(
        HttpApiEndpoint.get("getFavorites", "/api/v1/me/favorites", {
            success: Schema.Array(FavoriteSchema),
        }),
    )
    .add(
        HttpApiEndpoint.post("addFavorite", "/api/v1/me/favorites", {
            payload: FavoriteInputSchema,
            success: FavoriteSchema,
        }),
    )
    .add(
        /**
         * The removal key travels as a query rather than a body.
         *
         * `DELETE` with a payload is legal HTTP but sits awkwardly in the typed
         * client — the method decides whether a body is part of the request —
         * and a favourite is fully identified by its `(type, id)` pair, so a
         * query is the natural shape.
         */
        HttpApiEndpoint.delete("deleteFavorite", "/api/v1/me/favorites", {
            query: { type: Schema.String, id: Schema.String },
            success: HttpApiSchema.NoContent,
        }),
    )
    .add(
        HttpApiEndpoint.get("getConnections", "/api/v1/me/connections", {
            success: Schema.Array(ConnectionSchema),
        }),
    )
    .add(
        HttpApiEndpoint.post("syncConnections", "/api/v1/me/connections", {
            success: Schema.Array(ConnectionSchema),
        }),
    )

/**
 * Sign-in and sign-out.
 *
 * These answer with redirects and `Set-Cookie` rather than JSON, which is why
 * the declared success is a placeholder: the handlers return an
 * `HttpServerResponse`, and the redirect *is* the payload. They live on the API
 * because the session cookie must be minted by the worker that owns the session
 * table, and the API is routed on the app's own hostname — so the cookie is
 * same-site with the page that started the flow.
 */
const auth = HttpApiGroup.make("auth")
    .add(
        HttpApiEndpoint.get("discordLogin", "/api/v1/auth/discord", {
            success: Schema.String,
        }),
    )
    .add(
        HttpApiEndpoint.get(
            "discordCallback",
            "/api/v1/auth/discord/callback",
            {
                query: {
                    code: Schema.optionalKey(Schema.String),
                    state: Schema.optionalKey(Schema.String),
                    error: Schema.optionalKey(Schema.String),
                },
                success: Schema.String,
            },
        ),
    )
    .add(
        HttpApiEndpoint.post("signOut", "/api/v1/auth/signout", {
            success: HttpApiSchema.NoContent,
        }),
    )

/**
 * Brawlhalla's own answers, verbatim.
 *
 * The surface the product endpoints replaced, kept under one prefix so it is
 * obvious which half of the API is ours. Everything here is either a raw
 * upstream payload or a thin map of one; nothing aggregates and nothing is
 * shaped for a page. A client should prefer the product endpoint beside it, and
 * reach for this when it wants the payload itself.
 */
const upstream = HttpApiGroup.make("upstream")
    .add(
        HttpApiEndpoint.get("getPlayerStats", "/player/:playerId/stats", {
            params: { playerId: Schema.FiniteFromString },
            success: Schema.NullOr(PlayerStatsSchema),
        }),
    )
    .add(
        HttpApiEndpoint.get("getPlayerRanked", "/player/:playerId/ranked", {
            params: { playerId: Schema.FiniteFromString },
            // A player without ranked games is a valid, empty result.
            success: Schema.NullOr(PlayerRankedSchema),
        }),
    )
    .add(
        HttpApiEndpoint.get(
            "getPlayer3v3Ranked",
            "/player/:playerId/ranked-3v3",
            {
                params: { playerId: Schema.FiniteFromString },
                // Most players have never queued 3v3, so "no record" is an
                // ordinary result rather than a 404.
                success: Schema.NullOr(Player3v3RankedSchema),
            },
        ),
    )
    .add(
        HttpApiEndpoint.get("getPlayerAliases", "/player/:playerId/aliases", {
            params: { playerId: Schema.FiniteFromString },
            success: PlayerAliasesSchema,
        }),
    )
    .add(
        HttpApiEndpoint.get("getClanStats", "/clan/:clanId", {
            params: { clanId: Schema.FiniteFromString },
            success: Schema.NullOr(ClanSchema),
        }),
    )
    .add(
        HttpApiEndpoint.get("get1v1Rankings", "/rankings/1v1", {
            query: {
                region: RankedRegion,
                page: Schema.FiniteFromString,
                name: Schema.optionalKey(Schema.String),
            },
            success: Ranking1v1Schema,
        }),
    )
    .add(
        HttpApiEndpoint.get("get2v2Rankings", "/rankings/2v2", {
            query: {
                region: RankedRegion,
                page: Schema.FiniteFromString,
            },
            success: Ranking2v2Schema,
        }),
    )
    .add(
        HttpApiEndpoint.get("get3v3Rankings", "/rankings/3v3", {
            query: {
                region: RankedRegion,
                page: Schema.FiniteFromString,
            },
            success: Ranking3v3Schema,
        }),
    )
    /*
     * The prefix is applied last on purpose: `HttpApiGroup.prefix` only
     * rewrites the endpoints that exist at the moment it is called, so calling
     * it before the routes would leave every one of them unprefixed — and the
     * OpenAPI document is where that shows up first.
     */
    .prefix("/api/v1/upstream/brawlhalla")

export const CorehallaApi = HttpApi.make("CorehallaApi")
    .add(players)
    .add(guilds)
    .add(rankings)
    .add(search)
    .add(content)
    .add(me)
    .add(auth)
    .add(upstream)

export type CorehallaApi = typeof CorehallaApi
