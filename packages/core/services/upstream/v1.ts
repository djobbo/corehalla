import { Duration, Effect, Predicate, Schedule } from "effect"
import { HttpClient, HttpClientError } from "effect/http"
import { retryTransient } from "../retry"
import { withUserAgent } from "./user-agent"
import { legendsMap } from "@crh/bhapi/legends"
import { rankedRegions } from "@crh/bhapi/constants"
import type { ClanRank, RankedTier } from "@crh/bhapi/constants"
import type {
    Clan,
    Player3v3Ranked,
    PlayerRanked,
    PlayerStats,
    Ranking1v1,
    Ranking2v2,
    Ranking3v3,
} from "@crh/bhapi/types"

const V1_BASE = "https://api.brawlhalla.com/v1"

/** v1 regions are uppercase; Japan is JPS not JPN. */
export const v1Regions = [
    "ALL",
    "US-E",
    "EU",
    "SEA",
    "BRZ",
    "AUS",
    "US-W",
    "JPS",
    "SA",
    "ME",
] as const

export type V1Region = (typeof v1Regions)[number]

export const toV1Region = (region: string): V1Region => {
    const upper = region.toUpperCase()

    if (upper === "ALL") return "ALL"
    if (upper === "JPN") return "JPS"

    return (v1Regions as readonly string[]).includes(upper)
        ? (upper as V1Region)
        : "ALL"
}

export const fromV1Region = (region: string): string => {
    const lower = region.toLowerCase()

    return lower === "jps" ? "jpn" : lower
}

// --- response shapes -------------------------------------------------------

export type V1RankingEntry = {
    players: readonly { id: number; username: string }[]
    best_rating: number | null
    rank: number
    rating: number | null
    wins: number | null
    losses: number | null
    region: string | null
    tier: string | null
}

export type V1Leaderboard = {
    rankings: readonly V1RankingEntry[]
    total_pages: number
}

export type V1Guild = {
    guild_id: number
    name: string
    create_date: number
    xp: number
    legacy_xp?: number
    notice?: string
    tags?: readonly string[]
    discord_invite_code?: string
    guild_points?: number
    rank?: number | null
    is_recruiting?: boolean
    member_count?: number | null
}

/** `GetGuildMembers`. `name` optional — v1 omits the key; treat absence as blank. */
export type V1GuildMember = {
    brawlhalla_id: number
    name?: string
    rank: string
    join_date: number
    xp: number
    guild_points?: number
}

export type V1PlayerGuild = {
    brawlhalla_id: number
    guild?: {
        guild_id: number
        guild_name: string
        personal_xp: number
        personal_xp_this_week?: number
        personal_points?: number
        join_date: number
        rank: string
    }
}

export type V1PlayerMode = "all" | "ranked_1v1" | "ranked_3v3"

export type V1PlayerStatsLegend = {
    legend_id: number
    games: number
    wins: number
    damage_dealt?: number
    damage_taken?: number
    kos?: number
    falls?: number
    suicides?: number
    team_kos?: number
    match_time?: number
    damage_unarmed?: number
    damage_thrown_item?: number
    damage_weapon_one?: number
    damage_weapon_two?: number
    damage_gadgets?: number
    ko_unarmed?: number
    ko_thrown_item?: number
    ko_weapon_one?: number
    ko_weapon_two?: number
    ko_gadgets?: number
    time_held_weapon_one?: number
    time_held_weapon_two?: number
    xp?: number
    level?: number
    xp_percentage?: number
}

export type V1PlayerStats = {
    brawlhalla_id: number
    name: string
    games: number
    wins: number
    xp?: number
    xp_percentage?: number
    level?: number
    damage_bomb?: number
    damage_mine?: number
    damage_spikeball?: number
    damage_sidekick?: number
    hit_snowball?: number
    ko_bomb?: number
    ko_mine?: number
    ko_spikeball?: number
    ko_sidekick?: number
    ko_snowball?: number
    region_ranks?: readonly { region: string; rank: number }[]
    legends: readonly V1PlayerStatsLegend[]
}

/** Ranked mode swaps the damage legend shape for per-legend rating. */
export type V1RankedLegend = {
    legend_id: number
    games: number
    wins: number
    rating?: number | null
    peak_rating?: number | null
    tier?: string | null
}

export type V1PlayerRankedStats = {
    brawlhalla_id: number
    name: string
    games: number
    wins: number
    rating?: number | null
    peak_rating?: number | null
    tier?: string | null
    region?: string | null

    region_ranks?: readonly { region: string; rank: number }[]
    global_rank?: number | null
    legends: readonly V1RankedLegend[]
}

/** `/player/teams` team row — the v1 source for a player's ranked 2v2 record. */
export type V1Team = {
    brawlhalla_id_one: number
    brawlhalla_id_two: number
    username_one: string
    username_two: string
    rating: number
    peak_rating: number
    tier?: string | null
    wins: number
    games: number
    region: string
    region_ranks?: readonly { region: string; rank: number }[]
    global_rank?: number | null
}

export type V1PlayerTeams = {
    brawlhalla_id: number
    teams: { ranked_2v2: readonly V1Team[] }
}

// --- client ----------------------------------------------------------------

/** v1 answers `404 "Player not found"` both for real misses and transient origin errors. */
const isNotFound = (error: HttpClientError.HttpClientError): boolean =>
    HttpClientError.isHttpClientError(error) &&
    Predicate.isTagged(error.reason, "StatusCodeError") &&
    error.reason.response.status === 404

const notFoundRetry = Schedule.exponential(Duration.millis(500)).pipe(
    Schedule.upTo({ times: 3 }),
)

export const v1Ops = (client: HttpClient.HttpClient) => {
    const http = withUserAgent(HttpClient.filterStatusOk(client))

    const getJson = <A>(
        path: string,
        params: Record<string, string | number> = {},
    ) =>
        Effect.gen(function* () {
            const response = yield* http
                .get(`${V1_BASE}${path}`, {
                    urlParams: params,
                    acceptJson: true,
                })
                .pipe(retryTransient)

            const body = yield* response.json

            return body as unknown as A
        })

    const getOptionalJson = <A>(
        path: string,
        params: Record<string, string | number>,
    ) => getJson<A>(path, params).pipe(Effect.catch(() => Effect.succeed(null)))

    /**
     * For a read that should always exist (career stats). v1 answers
     * `404 "Player not found"` both for real misses and for transient origin
     * errors, so a 404 here is retried before it is believed; a persistent one
     * resolves to `null`, and anything else is a defect — never a cached miss.
     */
    const getRequiredJson = <A>(
        path: string,
        params: Record<string, string | number>,
    ) =>
        getJson<A>(path, params).pipe(
            Effect.retry({ schedule: notFoundRetry, while: isNotFound }),
            Effect.catchIf(isNotFound, () => Effect.succeed(null)),
            Effect.orDie,
        )

    return {
        getLeaderboard: (
            mode: "1v1" | "2v2" | "3v3",
            region: string,
            page: number,
            search?: string,
        ) =>
            getOptionalJson<V1Leaderboard>("/leaderboard/ranked", {
                game_mode: mode,
                region: toV1Region(region),
                page,
                max_results: 50,
                ...(search ? { search } : {}),
            }),

        getPlayerStats: (playerId: number, mode: V1PlayerMode = "all") =>
            getRequiredJson<V1PlayerStats>("/player/stats", {
                brawlhalla_id: playerId,
                mode,
            }),

        getPlayer1v1Stats: (playerId: number) =>
            getOptionalJson<V1PlayerRankedStats>("/player/stats", {
                brawlhalla_id: playerId,
                mode: "ranked_1v1" satisfies V1PlayerMode,
            }),

        getPlayer3v3Stats: (playerId: number) =>
            getOptionalJson<V1PlayerRankedStats>("/player/stats", {
                brawlhalla_id: playerId,
                mode: "ranked_3v3" satisfies V1PlayerMode,
            }),

        getPlayerTeams: (playerId: number) =>
            getOptionalJson<V1PlayerTeams>("/player/teams", {
                brawlhalla_id: playerId,
            }),

        getPlayerGuild: (playerId: number) =>
            getOptionalJson<V1PlayerGuild>("/player/guild", {
                brawlhalla_id: playerId,
            }),

        getGuildStats: (guildId: number) =>
            getOptionalJson<V1Guild>("/guild/stats", { guild_id: guildId }),

        getGuildMembers: (guildId: number) =>
            getOptionalJson<{
                guild_id: number
                guild_members: V1GuildMember[]
            }>("/guild/members", { guild_id: guildId }),
    }
}

export type V1Ops = ReturnType<typeof v1Ops>

// --- mapping onto our domain ----------------------------------------------

const NO_BEST_LEGEND = 0

/** v1 has no best_legend; wins+losses substitutes for absent games. */
const gamesOf = (entry: V1RankingEntry): number =>
    (entry.wins ?? 0) + (entry.losses ?? 0)

export const toRankings1v1 = (
    entries: readonly V1RankingEntry[],
): readonly Ranking1v1[] =>
    entries.map((entry) => ({
        rank: entry.rank,
        rating: entry.rating ?? 0,
        peak_rating: entry.best_rating ?? 0,
        games: gamesOf(entry),
        wins: entry.wins ?? 0,
        tier: (entry.tier ?? "Valhallan") as RankedTier,
        region: fromV1Region(entry.region ?? "ALL") as Ranking1v1["region"],
        name: entry.players[0]?.username ?? "",
        brawlhalla_id: entry.players[0]?.id ?? 0,
        best_legend: NO_BEST_LEGEND,
        best_legend_games: 0,
        best_legend_wins: 0,
    }))

export const toRankings2v2 = (
    entries: readonly V1RankingEntry[],
): readonly Ranking2v2[] =>
    entries.map((entry) => ({
        rank: entry.rank,
        rating: entry.rating ?? 0,
        peak_rating: entry.best_rating ?? 0,
        games: gamesOf(entry),
        wins: entry.wins ?? 0,
        tier: (entry.tier ?? "Valhallan") as RankedTier,
        region: fromV1Region(entry.region ?? "ALL") as Ranking2v2["region"],
        name_one: entry.players[0]?.username ?? "",
        name_two: entry.players[1]?.username ?? "",
        teamname: entry.players.map((player) => player.username).join("+"),
        brawlhalla_id_one: entry.players[0]?.id ?? 0,
        brawlhalla_id_two: entry.players[1]?.id ?? 0,
    }))

/** 3v3 is one player per row (solo queue), same shape as 1v1. */
export const toRankings3v3 = (
    entries: readonly V1RankingEntry[],
): readonly Ranking3v3[] =>
    entries.map((entry) => ({
        rank: entry.rank,
        rating: entry.rating ?? 0,
        peak_rating: entry.best_rating ?? 0,
        games: gamesOf(entry),
        wins: entry.wins ?? 0,
        tier: (entry.tier ?? "Valhallan") as RankedTier,
        region: fromV1Region(entry.region ?? "ALL") as Ranking3v3["region"],
        name: entry.players[0]?.username ?? "",
        brawlhalla_id: entry.players[0]?.id ?? 0,
    }))

/**
 * A `null` tier is Valhallan, not a missing field, so it does not make a page
 * incomplete; a null rating does.
 */
export const isCompleteLeaderboard = (
    board: V1Leaderboard | null,
    playersPerRow: number,
): boolean =>
    board !== null &&
    board.rankings.every(
        (entry) =>
            entry.rating !== null &&
            entry.rank > 0 &&
            entry.players.length === playersPerRow,
    )

export const toClan = (
    guild: V1Guild,
    members: readonly V1GuildMember[],
): Clan => ({
    clan_id: guild.guild_id,
    clan_name: guild.name,
    clan_create_date: guild.create_date,
    clan_xp: String(guild.xp),
    ...(guild.legacy_xp === undefined ? {} : { legacy_xp: guild.legacy_xp }),
    // Clan total includes historical contributors — do not sum the roster.
    guild_points: guild.guild_points,
    clan: members.map((member) => ({
        brawlhalla_id: member.brawlhalla_id,
        name: member.name ?? "",
        rank: member.rank as ClanRank,
        join_date: member.join_date,
        xp: member.xp,
        // v1 always sends this; normalise even though Clan allows absence for v0.
        guild_points: member.guild_points ?? 0,
    })),
})

export const isCompleteClan = (clan: Clan | null): boolean =>
    clan !== null &&
    clan.clan_name.trim().length > 0 &&
    clan.clan_create_date > 0

export const toPlayerStats = (
    stats: V1PlayerStats,
    clan: PlayerStats["clan"],
): PlayerStats => ({
    brawlhalla_id: stats.brawlhalla_id,
    name: stats.name,
    xp: stats.xp ?? 0,
    level: stats.level ?? 0,
    xp_percentage: stats.xp_percentage ?? 0,
    games: stats.games,
    wins: stats.wins,
    damagebomb: String(stats.damage_bomb ?? 0),
    damagemine: String(stats.damage_mine ?? 0),
    damagespikeball: String(stats.damage_spikeball ?? 0),
    damagesidekick: String(stats.damage_sidekick ?? 0),
    hitsnowball: stats.hit_snowball ?? 0,
    kobomb: stats.ko_bomb ?? 0,
    komine: stats.ko_mine ?? 0,
    kospikeball: stats.ko_spikeball ?? 0,
    kosidekick: stats.ko_sidekick ?? 0,
    kosnowball: stats.ko_snowball ?? 0,
    legends: stats.legends.map((legend) => ({
        legend_id: legend.legend_id,
        legend_name_key:
            legendsMap[legend.legend_id]?.legend_name_key ??
            String(legend.legend_id),
        damagedealt: String(legend.damage_dealt ?? 0),
        damagetaken: String(legend.damage_taken ?? 0),
        kos: legend.kos ?? 0,
        falls: legend.falls ?? 0,
        suicides: legend.suicides ?? 0,
        teamkos: legend.team_kos ?? 0,
        matchtime: legend.match_time ?? 0,
        games: legend.games,
        wins: legend.wins,
        damageunarmed: String(legend.damage_unarmed ?? 0),
        damagethrownitem: String(legend.damage_thrown_item ?? 0),
        damageweaponone: String(legend.damage_weapon_one ?? 0),
        damageweapontwo: String(legend.damage_weapon_two ?? 0),
        damagegadgets: String(legend.damage_gadgets ?? 0),
        kounarmed: legend.ko_unarmed ?? 0,
        kothrownitem: legend.ko_thrown_item ?? 0,
        koweaponone: legend.ko_weapon_one ?? 0,
        koweapontwo: legend.ko_weapon_two ?? 0,
        kogadgets: legend.ko_gadgets ?? 0,
        timeheldweaponone: legend.time_held_weapon_one ?? 0,
        timeheldweapontwo: legend.time_held_weapon_two ?? 0,
        xp: legend.xp ?? 0,
        level: legend.level ?? 0,
        xp_percentage: legend.xp_percentage ?? 0,
    })),
    ...(clan ? { clan } : {}),
})

export const isCompletePlayerStats = (stats: V1PlayerStats | null): boolean =>
    stats !== null &&
    stats.name.trim().length > 0 &&
    stats.xp !== undefined &&
    stats.level !== undefined

/** region_ranks dropped (list, not a single rank); null tier is Valhallan, not incomplete. */
export const toPlayer3v3Ranked = (
    stats: V1PlayerRankedStats,
): Player3v3Ranked => ({
    brawlhalla_id: stats.brawlhalla_id,
    name: stats.name,
    rating: stats.rating ?? 0,
    peak_rating: stats.peak_rating ?? 0,
    tier: (stats.tier ?? null) as RankedTier | null,
    wins: stats.wins,
    games: stats.games,
    region: fromV1Region(stats.region ?? "ALL") as Player3v3Ranked["region"],
})

/** Accept a null tier (Valhallan); require a name and a rating. */
export const isCompletePlayer3v3Ranked = (
    stats: V1PlayerRankedStats | null,
): boolean =>
    stats !== null && stats.name.trim().length > 0 && stats.rating != null

/** 1-based index into `rankedRegions`, the numeric region v0 carried on a team row. */
const regionIndex = (region: string): number => {
    const index = rankedRegions.indexOf(
        fromV1Region(region) as (typeof rankedRegions)[number],
    )

    return index < 0 ? 0 : index + 1
}

/**
 * The profile's ranked record, assembled from v1 alone: account and legend
 * ratings from `/player/stats?mode=ranked_1v1`, the 2v2 teams from
 * `/player/teams`. Keeps the `PlayerRanked` shape so aggregates and schemas are
 * untouched — including the numeric `2v2[].region`, which v1 reports as a code.
 *
 * A 2v2-only player has teams but no placed 1v1 account record, so a missing or
 * unranked account must not drop the teams.
 */
export const toPlayerRanked = (
    stats: V1PlayerRankedStats | null,
    teams: V1PlayerTeams | null,
): PlayerRanked | null => {
    const teamRows = teams?.teams.ranked_2v2 ?? []
    const account =
        stats !== null && stats.name.trim().length > 0 ? stats : null

    if (account === null && teamRows.length === 0) return null

    return {
        name: account?.name ?? teamRows[0]?.username_one ?? "",
        brawlhalla_id:
            account?.brawlhalla_id ?? teamRows[0]?.brawlhalla_id_one ?? 0,
        global_rank: account?.global_rank ?? 0,
        // v1 sends a rank list, not the scalar v0 sent; nothing reads this field.
        region_rank: 0,
        legends: (account?.legends ?? []).map((legend) => ({
            legend_id: legend.legend_id,
            legend_name_key:
                legendsMap[legend.legend_id]?.legend_name_key ??
                String(legend.legend_id),
            rating: legend.rating ?? 0,
            peak_rating: legend.peak_rating ?? 0,
            tier: (legend.tier ?? null) as RankedTier | null,
            wins: legend.wins,
            games: legend.games,
        })),
        "2v2": teamRows.map((team) => ({
            brawlhalla_id_one: team.brawlhalla_id_one,
            brawlhalla_id_two: team.brawlhalla_id_two,
            name_one: team.username_one,
            name_two: team.username_two,
            rating: team.rating,
            peak_rating: team.peak_rating,
            tier: (team.tier ?? "Valhallan") as RankedTier,
            wins: team.wins,
            games: team.games,
            teamname: `${team.username_one}+${team.username_two}`,
            region: regionIndex(team.region),
            global_rank: team.global_rank ?? 0,
        })),
        rating: account?.rating ?? 0,
        peak_rating: account?.peak_rating ?? 0,
        tier: (account?.tier ?? null) as RankedTier | null,
        wins: account?.wins ?? 0,
        games: account?.games ?? 0,
        region: fromV1Region(
            account?.region ?? teamRows[0]?.region ?? "ALL",
        ) as PlayerRanked["region"],
    }
}
