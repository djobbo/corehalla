import {
    HttpApi,
    HttpApiEndpoint,
    HttpApiError,
    HttpApiGroup,
    HttpApiSchema,
} from "effect/http-api"
import { Schema } from "effect"
import {
    AliasSearchResultsSchema,
    ArticlesPageSchema,
    ArticleSchema,
    CareerRankingsSchema,
    ClanSchema,
    ClansSchema,
    CmsArticleSchema,
    CmsArticlesPageSchema,
    CmsMediaManifestSchema,
    ConnectionSchema,
    FavoriteInputSchema,
    FavoriteSchema,
    GuildEnvelopeSchema,
    Ladder,
    LookupResultsSchema,
    NewsCategory,
    Player3v3RankedSchema,
    PlayerAliasesSchema,
    PlayerClanEnvelopeSchema,
    PlayerEsportsEnvelopeSchema,
    PlayerLegendsEnvelopeSchema,
    PlayerProfileEnvelopeSchema,
    PlayerRankedSchema,
    PlayerStatsSchema,
    PlayerTeamsEnvelopeSchema,
    PlayerWeaponsEnvelopeSchema,
    SectionFailed,
    SectionRateLimited,
    SectionTimedOut,
    PowerRankingsEnvelopeSchema,
    PowerRankingsGameMode,
    PowerRankingsOrderBy,
    PowerRankingsRegion,
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

const sectionErrors = [
    SectionFailed,
    SectionRateLimited,
    SectionTimedOut,
] as const

const players = HttpApiGroup.make("players")
    .add(
        // Header + overview. Every other section is lazy.
        HttpApiEndpoint.get("getPlayer", "/api/v1/players/:playerId", {
            params: { playerId: Schema.FiniteFromString },
            success: PlayerProfileEnvelopeSchema,
            // Unknown player is 404, not an empty payload — the page needs stats.
            error: [HttpApiError.NotFound, ...sectionErrors],
        }),
    )
    .add(
        HttpApiEndpoint.get(
            "getPlayerLegends",
            "/api/v1/players/:playerId/legends",
            {
                params: { playerId: Schema.FiniteFromString },
                success: PlayerLegendsEnvelopeSchema,
                error: [HttpApiError.NotFound, ...sectionErrors],
            },
        ),
    )
    .add(
        HttpApiEndpoint.get(
            "getPlayerWeapons",
            "/api/v1/players/:playerId/weapons",
            {
                params: { playerId: Schema.FiniteFromString },
                success: PlayerWeaponsEnvelopeSchema,
                error: [HttpApiError.NotFound, ...sectionErrors],
            },
        ),
    )
    .add(
        HttpApiEndpoint.get(
            "getPlayerTeams",
            "/api/v1/players/:playerId/teams",
            {
                params: { playerId: Schema.FiniteFromString },
                success: PlayerTeamsEnvelopeSchema,
                error: [HttpApiError.NotFound, ...sectionErrors],
            },
        ),
    )
    .add(
        HttpApiEndpoint.get("getPlayerClan", "/api/v1/players/:playerId/clan", {
            params: { playerId: Schema.FiniteFromString },
            success: PlayerClanEnvelopeSchema,
            error: [HttpApiError.NotFound, ...sectionErrors],
        }),
    )
    .add(
        // Esports data is keyed by Brawlhalla id; identity resolves from there.
        HttpApiEndpoint.get(
            "getPlayerEsports",
            "/api/v1/players/:playerId/esports",
            {
                params: { playerId: Schema.FiniteFromString },
                success: PlayerEsportsEnvelopeSchema,
                error: sectionErrors,
            },
        ),
    )

const guilds = HttpApiGroup.make("guilds").add(
    HttpApiEndpoint.get("getGuild", "/api/v1/guilds/:guildId", {
        params: { guildId: Schema.FiniteFromString },
        success: GuildEnvelopeSchema,
        error: [HttpApiError.NotFound, ...sectionErrors],
    }),
)

const rankings = HttpApiGroup.make("rankings")
    .add(
        HttpApiEndpoint.get("getRanked1v1", "/api/v1/rankings/1v1", {
            query: {
                region: RankedRegion,
                page: Schema.FiniteFromString,
                name: Schema.optionalKey(Schema.String),
            },
            success: Rankings1v1EnvelopeSchema,
            error: sectionErrors,
        }),
    )
    .add(
        HttpApiEndpoint.get("getRanked2v2", "/api/v1/rankings/2v2", {
            query: {
                region: RankedRegion,
                page: Schema.FiniteFromString,
            },
            success: Rankings2v2EnvelopeSchema,
            error: sectionErrors,
        }),
    )
    .add(
        // v1-only: the legacy API has no 3v3 mode.
        HttpApiEndpoint.get("getRanked3v3", "/api/v1/rankings/3v3", {
            query: {
                region: RankedRegion,
                page: Schema.FiniteFromString,
            },
            success: Rankings3v3EnvelopeSchema,
            error: sectionErrors,
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
        // brawltools v2: game modes and regions are its own vocabulary, and the
        // sort column is a field (direction is derived server-side).
        HttpApiEndpoint.get("getPowerRankings", "/api/v1/rankings/power", {
            query: {
                gameMode: PowerRankingsGameMode,
                region: PowerRankingsRegion,
                page: Schema.FiniteFromString,
                orderBy: PowerRankingsOrderBy,
            },
            success: PowerRankingsEnvelopeSchema,
            error: sectionErrors,
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
        HttpApiEndpoint.get("lookup", "/api/v1/search", {
            query: {
                q: Schema.String,
                region: Schema.optionalKey(RankedRegion),
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
                category: Schema.optionalKey(NewsCategory),
                page: Schema.optionalKey(Schema.FiniteFromString),
                pageSize: Schema.optionalKey(Schema.FiniteFromString),
            },
            success: ArticlesPageSchema,
        }),
    )
    .add(
        // Article slugs are page-sized; category listings live under `/news/category`.
        HttpApiEndpoint.get("getBHArticle", "/api/v1/content/articles/:slug", {
            params: { slug: Schema.String },
            success: ArticleSchema,
            error: HttpApiError.NotFound,
        }),
    )

const cms = HttpApiGroup.make("cms")
    .add(
        HttpApiEndpoint.get("getMediaManifest", "/api/v1/cms/media", {
            success: CmsMediaManifestSchema,
        }),
    )
    .add(
        HttpApiEndpoint.get("getCmsArticles", "/api/v1/cms/articles", {
            query: {
                page: Schema.optionalKey(Schema.FiniteFromString),
                pageSize: Schema.optionalKey(Schema.FiniteFromString),
                category: Schema.optionalKey(Schema.String),
            },
            success: CmsArticlesPageSchema,
        }),
    )
    .add(
        HttpApiEndpoint.get("getCmsArticle", "/api/v1/cms/articles/:slug", {
            params: { slug: Schema.String },
            success: CmsArticleSchema,
            error: HttpApiError.NotFound,
        }),
    )

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
        // Query rather than body: favourite is identified by `(type, id)`.
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
            // No ranked games is a valid empty result, not a 404.
            success: Schema.NullOr(PlayerRankedSchema),
        }),
    )
    .add(
        HttpApiEndpoint.get(
            "getPlayer3v3Ranked",
            "/player/:playerId/ranked-3v3",
            {
                params: { playerId: Schema.FiniteFromString },
                // Most players never queued 3v3 — "no record" is ordinary, not 404.
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
    // Prefix last: `HttpApiGroup.prefix` only rewrites endpoints already added.
    .prefix("/api/v1/upstream/brawlhalla")

export const CorehallaApi = HttpApi.make("CorehallaApi")
    .add(players)
    .add(guilds)
    .add(rankings)
    .add(search)
    .add(content)
    .add(cms)
    .add(me)
    .add(auth)
    .add(upstream)

export type CorehallaApi = typeof CorehallaApi
