import { Context, Effect, Layer } from "effect"
import { HttpClient } from "effect/http"
import { Database } from "../archive"
import { Background } from "../background"
import { Cache } from "../cache"
import { cacheKeys, cacheTtl } from "../cache-policy"
import type { Cached } from "../cache"
import { snapshotFromRanked } from "../player-writes"
import {
    isCompleteClan,
    isCompleteLeaderboard,
    isCompletePlayer3v3Ranked,
    isCompletePlayerStats,
    toClan,
    toPlayer3v3Ranked,
    toPlayerRanked,
    toPlayerStats,
    toRankings1v1,
    toRankings2v2,
    toRankings3v3,
    v1Ops,
} from "./v1"
import type {
    Ladder,
    Clan,
    Player3v3Ranked,
    PlayerRanked,
    PlayerStats,
    Ranking1v1,
    Ranking2v2,
    Ranking3v3,
} from "@crh/bhapi/types"
import type { RankedRegion } from "@crh/bhapi/constants"

type UpstreamShape = {
    readonly getRankings: (
        bracket: Ladder,
        region: RankedRegion,
        page: number,
        name?: string,
    ) => Effect.Effect<readonly (Ranking1v1 | Ranking2v2 | Ranking3v3)[]>

    /** Career stats without clan — separate from getPlayerClan so crawler can warm this half. */
    readonly getPlayerStats: (
        playerId: number,
    ) => Effect.Effect<PlayerStats | null>
    /**
     * clan_xp from our BHClan row (v1 guild has none). Missing/storage fail → null
     * so contribution % never divides by a placeholder.
     */
    readonly getPlayerClan: (
        playerId: number,
    ) => Effect.Effect<PlayerStats["clan"] | null>
    readonly getPlayerRanked: (
        playerId: number,
    ) => Effect.Effect<PlayerRanked | null>
    readonly getPlayer3v3Ranked: (
        playerId: number,
    ) => Effect.Effect<Player3v3Ranked | null>
    readonly getClan: (clanId: number) => Effect.Effect<Clan | null>
}

/**
 * v1-only, no cache. Crawler uses this — caching/damping here would throttle
 * the refresh path that exists to protect the budget.
 */
export class Upstream extends Context.Service<Upstream, UpstreamShape>()(
    "app/Upstream",
) {}

export const rawLayer = Layer.effect(
    Upstream,
    Effect.gen(function* () {
        const client = yield* HttpClient.HttpClient
        const database = yield* Database

        const v1 = v1Ops(client)

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

                    if (
                        board === null ||
                        !isCompleteLeaderboard(board, playersPerRow)
                    ) {
                        yield* Effect.logDebug(
                            `v1 could not serve ${bracket} rankings ` +
                                `(${region} page ${page})`,
                        )

                        return []
                    }

                    if (bracket === "1v1") return toRankings1v1(board.rankings)

                    return bracket === "2v2"
                        ? toRankings2v2(board.rankings)
                        : toRankings3v3(board.rankings)
                }),

            getPlayerStats: (playerId) =>
                Effect.gen(function* () {
                    const stats = yield* v1.getPlayerStats(playerId, "all")

                    if (stats === null || !isCompletePlayerStats(stats)) {
                        yield* Effect.logDebug(
                            `v1 could not serve player ${playerId} stats`,
                        )

                        return null
                    }

                    return toPlayerStats(stats, undefined)
                }),

            getPlayerClan: (playerId) =>
                Effect.gen(function* () {
                    const membership = yield* v1.getPlayerGuild(playerId)
                    const guild = membership?.guild

                    if (!guild) return null

                    // No real clan_xp → no card (avoids Infinity%). Storage fail = missing.
                    const clanXp = yield* database
                        .getClanXp(String(guild.guild_id))
                        .pipe(Effect.catch(() => Effect.succeed(null)))

                    if (!clanXp) return null

                    return {
                        clan_name: guild.guild_name,
                        clan_id: guild.guild_id,
                        clan_xp: clanXp,
                        personal_xp: guild.personal_xp,
                    }
                }),

            // Account + legend ratings from ranked_1v1; 2v2 teams from /player/teams.
            getPlayerRanked: (playerId) =>
                Effect.gen(function* () {
                    const [stats, teams] = yield* Effect.all(
                        [
                            v1.getPlayer1v1Stats(playerId),
                            v1.getPlayerTeams(playerId),
                        ],
                        { concurrency: 2 },
                    )

                    return toPlayerRanked(stats, teams)
                }),

            // 3v3 is v1-only; null means no record, not a failed page.
            getPlayer3v3Ranked: (playerId) =>
                Effect.gen(function* () {
                    const stats = yield* v1.getPlayer3v3Stats(playerId)

                    if (stats === null || !isCompletePlayer3v3Ranked(stats)) {
                        yield* Effect.logDebug(
                            `v1 could not serve 3v3 ranked for player ` +
                                `${playerId}`,
                        )

                        return null
                    }

                    return toPlayer3v3Ranked(stats)
                }),

            getClan: (clanId) =>
                Effect.gen(function* () {
                    const [guild, members] = yield* Effect.all(
                        [v1.getGuildStats(clanId), v1.getGuildMembers(clanId)],
                        { concurrency: 2 },
                    )

                    const clan = guild
                        ? toClan(guild, members?.guild_members ?? [])
                        : null

                    if (isCompleteClan(clan)) return clan

                    yield* Effect.logDebug(`v1 could not serve guild ${clanId}`)

                    return null
                }),
        }
    }),
)

/** Cached gateway; returns Cached so aggregates can take the oldest updatedAt. */
export type BrawlhallaShape = {
    readonly getRankings: (
        bracket: Ladder,
        region: RankedRegion,
        page: number,
        name?: string,
    ) => Effect.Effect<
        Cached<readonly (Ranking1v1 | Ranking2v2 | Ranking3v3)[]>
    >
    readonly getPlayerStats: (
        playerId: number,
    ) => Effect.Effect<Cached<PlayerStats | null>>
    readonly getPlayerRanked: (
        playerId: number,
    ) => Effect.Effect<Cached<PlayerRanked | null>>
    readonly getPlayer3v3Ranked: (
        playerId: number,
    ) => Effect.Effect<Cached<Player3v3Ranked | null>>
    readonly getClan: (clanId: number) => Effect.Effect<Cached<Clan | null>>
}

export class Brawlhalla extends Context.Service<Brawlhalla, BrawlhallaShape>()(
    "app/Brawlhalla",
) {}

/** Requires Upstream+Cache — do not provide them so callers can share Upstream. */
export const layer = Layer.effect(
    Brawlhalla,
    Effect.gen(function* () {
        const cache = yield* Cache
        const upstream = yield* Upstream
        const database = yield* Database
        const background = yield* Background

        // Archive writes run on cache miss/refresh only — not on every read.
        return {
            getRankings: (bracket, region, page, name) =>
                cache.getOrSetCached(
                    cacheKeys.leaderboard(bracket, region, page, name),
                    cacheTtl.leaderboard,
                    upstream.getRankings(bracket, region, page, name),
                ),

            // Stats + clan are separate keys so the crawler can warm stats alone.
            getPlayerStats: (playerId) =>
                Effect.gen(function* () {
                    const stats = yield* cache.getOrSetCached(
                        cacheKeys.playerStats(playerId),
                        cacheTtl.profile,
                        upstream
                            .getPlayerStats(playerId)
                            .pipe(
                                Effect.tap((value) =>
                                    value === null
                                        ? Effect.void
                                        : background.run(
                                              database.upsertPlayerStats(
                                                  value,
                                                  null,
                                              ),
                                          ),
                                ),
                            ),
                    )

                    if (stats.value === null) return stats

                    const clan = yield* cache.getOrSetCached(
                        cacheKeys.playerClan(playerId),
                        cacheTtl.profile,
                        upstream.getPlayerClan(playerId),
                    )

                    return {
                        value:
                            clan.value === null
                                ? stats.value
                                : { ...stats.value, clan: clan.value },
                        updatedAt: Math.min(stats.updatedAt, clan.updatedAt),
                    }
                }),

            getPlayerRanked: (playerId) =>
                cache.getOrSetCached(
                    cacheKeys.playerRanked(playerId),
                    cacheTtl.profile,
                    upstream.getPlayerRanked(playerId).pipe(
                        Effect.tap((ranked) => {
                            if (ranked === null) return Effect.void

                            const snapshot = snapshotFromRanked(ranked)

                            return snapshot === null
                                ? Effect.void
                                : background.run(
                                      database.upsertPlayerRanked(
                                          {
                                              id: ranked.brawlhalla_id.toString(),
                                              name: ranked.name,
                                          },
                                          snapshot,
                                      ),
                                  )
                        }),
                    ),
                ),

            getPlayer3v3Ranked: (playerId) =>
                cache.getOrSetCached(
                    cacheKeys.player3v3Ranked(playerId),
                    cacheTtl.profile,
                    upstream.getPlayer3v3Ranked(playerId),
                ),

            getClan: (clanId) =>
                cache.getOrSetCached(
                    cacheKeys.clan(clanId),
                    cacheTtl.profile,
                    upstream.getClan(clanId),
                ),
        }
    }),
)
