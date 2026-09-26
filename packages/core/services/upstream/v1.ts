import { Effect } from "effect"
import { HttpClient } from "effect/unstable/http"
import { retryTransient } from "../retry"
import { legendsMap } from "@crh/bhapi/legends"
import type { ClanRank, RankedTier } from "@crh/bhapi/constants"
import type { Clan, PlayerStats, Ranking1v1, Ranking2v2 } from "@crh/bhapi/types"

/**
 * Brawlhalla API **v1** (`https://api.brawlhalla.com/v1`).
 *
 * Hand-written response types rather than Effect `Schema`: the legacy client
 * casts its payloads too, and validating every upstream response is a separate
 * change with its own cost profile. What v1 *does* get is the null contract
 * spelled out — several fields are documented as "may appear null … retry the
 * call later", and those are exactly the fields the predicates below test
 * before a v1 result is accepted over v0.
 */

const V1_BASE = "https://api.brawlhalla.com/v1"

/**
 * Region codes v1 accepts.
 *
 * Two traps versus v0: everything is uppercase, and Japan is `JPS`, not `jpn`
 * (our stored vocabulary is lowercase, so a round trip has to translate both
 * ways). `ALL` is a first-class region, which is what lets a global name search
 * be a single request instead of one per region.
 */
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

/** Maps our lowercase region vocabulary onto v1's uppercase codes. */
export const toV1Region = (region: string): V1Region => {
    const upper = region.toUpperCase()

    if (upper === "ALL") return "ALL"
    if (upper === "JPN") return "JPS"

    return (v1Regions as readonly string[]).includes(upper)
        ? (upper as V1Region)
        : "ALL"
}

/** Maps a v1 region back into our stored vocabulary (`JPS` -> `jpn`). */
export const fromV1Region = (region: string): string => {
    const lower = region.toLowerCase()

    return lower === "jps" ? "jpn" : lower
}

// --- response shapes -------------------------------------------------------

/** `GetRankings`. `rating`/`wins`/`losses` are documented as nullable. */
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

/** `GetGuildStats`. `rank` and `member_count` may be absent for a new guild. */
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

/** `GetGuildMembers`. */
export type V1GuildMember = {
    brawlhalla_id: number
    name: string
    rank: string
    join_date: number
    xp: number
    guild_points?: number
}

/** `GetPlayerGuild`. Carries the membership, but not the clan's own XP. */
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

/**
 * Modes `GetPlayerStats` accepts.
 *
 * Note what is *not* here: there is no 2v2 mode. `ranked_1v1` and `ranked_3v3`
 * are the only ranked modes v1 exposes, which is why the profile's 2v2 tab has
 * no v1 source at all.
 */
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

/** `GetPlayerStats`. `xp`/`level` only exist in `all` mode. */
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

// --- client ----------------------------------------------------------------

export const v1Ops = (client: HttpClient.HttpClient) => {
    const http = HttpClient.filterStatusOk(client)

    const getJson = <A>(
        path: string,
        params: Record<string, string | number> = {},
    ) =>
        Effect.gen(function* () {
            // No `api_key`: v1 is unauthenticated. Only the legacy v0 client
            // carries the key, and only v0 therefore needs the secret.
            const response = yield* http
                .get(`${V1_BASE}${path}`, {
                    urlParams: params,
                    acceptJson: true,
                })
                .pipe(retryTransient)

            const body = yield* response.json

            return body as unknown as A
        })

    /**
     * `null` when v1 does not know the resource — but also when v1 failed, since
     * this collapses transport errors and 404s alike. Callers must read `null`
     * as "v1 could not answer", never as "does not exist".
     */
    const getOptionalJson = <A>(
        path: string,
        params: Record<string, string | number>,
    ) =>
        getJson<A>(path, params).pipe(
            Effect.catch(() => Effect.succeed(null)),
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
                // Always explicit: v1 defaults `max_results` to 10, which would
                // silently shrink a 50-row page to 10.
                max_results: 50,
                ...(search ? { search } : {}),
            }),

        getPlayerStats: (playerId: number, mode: V1PlayerMode = "all") =>
            getOptionalJson<V1PlayerStats>("/player/stats", {
                brawlhalla_id: playerId,
                mode,
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

/**
 * `best_legend` and its two companions are **not in v1**.
 *
 * The only consumer is the 1v1 leaderboard's legend icon, rendered as
 * `{legend && <Image …/>}` — so a `0` id drops the icon rather than breaking the
 * row. Filling this from the local `BHPlayerLegend` archive is the change that
 * would restore it.
 */
const NO_BEST_LEGEND = 0

/** `games` is absent from v1 entirely; wins + losses is the same number. */
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
        tier: entry.tier as RankedTier,
        region: fromV1Region(entry.region ?? "ALL") as Ranking1v1["region"],
        name: entry.players[0]?.username ?? "",
        brawlhalla_id: entry.players[0]?.id ?? 0,
        best_legend: NO_BEST_LEGEND,
        best_legend_games: 0,
        best_legend_wins: 0,
    }))

/**
 * Team rows carry `players[]` in v1 where v0 carried one `teamname` string.
 *
 * The 2v2 leaderboard never renders `teamname` — it calls `getTeamPlayers`,
 * which splits that string on `"+"` — so re-joining the usernames round-trips
 * exactly, and the ids come from v1 rather than being parsed out of a name.
 */
export const toRankings2v2 = (
    entries: readonly V1RankingEntry[],
): readonly Ranking2v2[] =>
    entries.map((entry) => ({
        rank: entry.rank,
        rating: entry.rating ?? 0,
        peak_rating: entry.best_rating ?? 0,
        games: gamesOf(entry),
        wins: entry.wins ?? 0,
        tier: entry.tier as RankedTier,
        region: fromV1Region(entry.region ?? "ALL") as Ranking2v2["region"],
        teamname: entry.players.map((player) => player.username).join("+"),
        brawlhalla_id_one: entry.players[0]?.id ?? 0,
        brawlhalla_id_two: entry.players[1]?.id ?? 0,
    }))

/**
 * Whether a v1 page can stand in for v0.
 *
 * v1 documents `rating`, `best_rating`, `wins` and `losses` as possibly null
 * ("try your call again later"). Dropping individual rows would leave holes in
 * the rank numbering, so an incomplete page is rejected whole and v0 serves it.
 * `tier` is tested too: it is nullable per the schema, and the domain field it
 * maps onto is not.
 */
export const isCompleteLeaderboard = (
    board: V1Leaderboard | null,
    playersPerRow: number,
): boolean =>
    board !== null &&
    board.rankings.every(
        (entry) =>
            entry.rating !== null &&
            entry.tier !== null &&
            entry.rank > 0 &&
            entry.players.length === playersPerRow,
    )

/** `GetGuildStats` + `GetGuildMembers` -> the `Clan` shape the app renders. */
export const toClan = (
    guild: V1Guild,
    members: readonly V1GuildMember[],
): Clan => ({
    clan_id: guild.guild_id,
    clan_name: guild.name,
    clan_create_date: guild.create_date,
    clan_xp: String(guild.xp),
    clan: members.map((member) => ({
        brawlhalla_id: member.brawlhalla_id,
        name: member.name,
        rank: member.rank as ClanRank,
        join_date: member.join_date,
        xp: member.xp,
    })),
})

/**
 * Whether a mapped guild is complete enough to serve instead of v0.
 *
 * The docs warn that a recently created (uncached) guild can return blank
 * `rank`/`member_count` and advise retrying later. Neither is part of `Clan`, so
 * the test is on the fields we render: a missing name or creation date means v1
 * could not answer and v0 takes the request instead of shipping a blank page.
 */
export const isCompleteClan = (clan: Clan | null): boolean =>
    clan !== null &&
    clan.clan_name.trim().length > 0 &&
    clan.clan_create_date > 0

/**
 * `GetPlayerStats` -> the `PlayerStats` shape the app renders.
 *
 * `legend_name_key` is not in the v1 payload; it comes from the bundled legend
 * table by id, the same source the rest of the app uses.
 *
 * `clan` is passed in rather than derived: v1 moved it to `/player/guild`, which
 * carries the membership but not the clan's own XP. `clan_xp` is both rendered
 * and divided by (`ClanContent`), so a fabricated value would print `Infinity%`
 * — the caller omits the clan instead when it cannot supply a real one.
 */
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

/**
 * Whether a v1 player payload can stand in for v0.
 *
 * `xp` and `level` are `all`-mode only, so requiring them is what proves v1
 * answered the mode we asked for rather than degrading to a ranked payload with
 * the account fields missing.
 */
export const isCompletePlayerStats = (stats: V1PlayerStats | null): boolean =>
    stats !== null &&
    stats.name.trim().length > 0 &&
    stats.xp !== undefined &&
    stats.level !== undefined
