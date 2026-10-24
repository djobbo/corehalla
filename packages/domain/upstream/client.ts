import { Effect } from "effect"
import type { HttpClient } from "effect/http"
import {
    V1Incomplete,
    isCompleteClan,
    isCompleteLeaderboard,
    isCompletePlayer3v3Ranked,
    isCompletePlayerStats,
    mergePlayerRanked,
    toClan,
    toPlayer3v3Ranked,
    toPlayerRankedAccount,
    toPlayerStats,
    toPlayerTeams,
    toRankings1v1,
    toRankings2v2,
    toRankings3v3,
    v1Ops,
} from "./v1"
import type { V1Error, V1Options } from "./v1"
import type {
    Clan,
    Ladder,
    Player3v3Ranked,
    PlayerRanked,
    PlayerStats,
    Ranking1v1,
    Ranking2v2,
    Ranking3v3,
} from "@crh/bhapi/types"
import type { RankedRegion } from "@crh/bhapi/constants"

/** Domain reads over Brawlhalla v1, shared by the API worker and the browser fallback. */
export type V1UpstreamShape = {
    readonly getRankings: (
        bracket: Ladder,
        region: RankedRegion,
        page: number,
        name?: string,
    ) => Effect.Effect<
        readonly (Ranking1v1 | Ranking2v2 | Ranking3v3)[],
        V1Error
    >
    readonly getPlayerStats: (
        playerId: number,
    ) => Effect.Effect<PlayerStats | null, V1Error>
    readonly getPlayerClan: (
        playerId: number,
    ) => Effect.Effect<PlayerStats["clan"] | null, V1Error>
    readonly getPlayerRanked1v1: (
        playerId: number,
    ) => Effect.Effect<PlayerRanked | null, V1Error>
    readonly getPlayerTeams: (
        playerId: number,
    ) => Effect.Effect<PlayerRanked["2v2"], V1Error>
    readonly getPlayerRanked: (
        playerId: number,
    ) => Effect.Effect<PlayerRanked | null, V1Error>
    readonly getPlayer3v3Ranked: (
        playerId: number,
    ) => Effect.Effect<Player3v3Ranked | null, V1Error>
    readonly getClan: (clanId: number) => Effect.Effect<Clan | null, V1Error>
}

const incomplete = (operation: string, detail: string): V1Error =>
    new V1Incomplete({ operation, cause: detail })

/**
 * Builds the v1 read surface on an already-configured client. The API worker
 * adds a `User-Agent` before calling this; the browser must not.
 */
export const makeUpstream = (
    client: HttpClient.HttpClient,
    options: V1Options = {},
): V1UpstreamShape => {
    const v1 = v1Ops(client, options)

    return {
        getRankings: (bracket, region, page, name) =>
            Effect.gen(function* () {
                const board = yield* v1.getLeaderboard(
                    bracket,
                    region,
                    page,
                    name,
                )

                // 3v3 is one player/row (solo queue), not a trio; 2v2 is two.
                const playersPerRow = bracket === "2v2" ? 2 : 1

                if (board === null) return []

                if (!isCompleteLeaderboard(board, playersPerRow)) {
                    yield* Effect.logDebug(
                        `v1 could not serve ${bracket} rankings ` +
                            `(${region} page ${page})`,
                    )

                    return yield* Effect.fail(
                        incomplete("getRankings", "incomplete leaderboard"),
                    )
                }

                if (bracket === "1v1") return toRankings1v1(board.rankings)

                return bracket === "2v2"
                    ? toRankings2v2(board.rankings)
                    : toRankings3v3(board.rankings)
            }),

        getPlayerStats: (playerId) =>
            Effect.gen(function* () {
                const stats = yield* v1.getPlayerStats(playerId, "all")

                if (stats === null) return null

                if (!isCompletePlayerStats(stats)) {
                    yield* Effect.logDebug(
                        `v1 could not serve player ${playerId} stats`,
                    )

                    return yield* Effect.fail(
                        incomplete("getPlayerStats", "incomplete player stats"),
                    )
                }

                return toPlayerStats(stats, undefined)
            }),

        getPlayerClan: (playerId) =>
            Effect.gen(function* () {
                const membership = yield* v1.getPlayerGuild(playerId)
                const guild = membership?.guild

                if (!guild) return null

                // Clan XP (the contribution denominator) comes from
                // `/guild/stats`; this read only identifies the membership.
                return {
                    clan_name: guild.guild_name,
                    clan_id: guild.guild_id,
                    clan_xp: "0",
                    personal_xp: guild.personal_xp,
                }
            }),

        getPlayerRanked1v1: (playerId) =>
            Effect.gen(function* () {
                const stats = yield* v1.getPlayer1v1Stats(playerId)

                return toPlayerRankedAccount(stats)
            }),

        getPlayerTeams: (playerId) =>
            Effect.gen(function* () {
                const teams = yield* v1.getPlayerTeams(playerId)

                return toPlayerTeams(teams)
            }),

        // Account + legend ratings from ranked_1v1; 2v2 teams from /player/teams.
        getPlayerRanked: (playerId) =>
            Effect.gen(function* () {
                const [account, teams] = yield* Effect.all(
                    [
                        v1.getPlayer1v1Stats(playerId),
                        v1.getPlayerTeams(playerId),
                    ],
                    { concurrency: 2 },
                )

                return mergePlayerRanked(
                    toPlayerRankedAccount(account),
                    toPlayerTeams(teams),
                )
            }),

        // 3v3 is v1-only; null means no record, not a failed page.
        getPlayer3v3Ranked: (playerId) =>
            Effect.gen(function* () {
                const stats = yield* v1.getPlayer3v3Stats(playerId)

                if (stats === null) return null

                if (!isCompletePlayer3v3Ranked(stats)) {
                    yield* Effect.logDebug(
                        `v1 could not serve 3v3 ranked for player ` +
                            `${playerId}`,
                    )

                    return yield* Effect.fail(
                        incomplete(
                            "getPlayer3v3Ranked",
                            "incomplete 3v3 ranked",
                        ),
                    )
                }

                return toPlayer3v3Ranked(stats)
            }),

        getClan: (clanId) =>
            Effect.gen(function* () {
                const [guild, members] = yield* Effect.all(
                    [v1.getGuildStats(clanId), v1.getGuildMembers(clanId)],
                    { concurrency: 2 },
                )

                if (guild === null) return null

                if (members === null) {
                    return yield* Effect.fail(
                        incomplete("getClan", "guild members unavailable"),
                    )
                }

                const clan = toClan(guild, members.guild_members)

                if (isCompleteClan(clan)) return clan

                yield* Effect.logDebug(`v1 could not serve guild ${clanId}`)

                return yield* Effect.fail(
                    incomplete("getClan", "incomplete guild"),
                )
            }),
    }
}
