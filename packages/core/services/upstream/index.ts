import { Context, Effect, Layer } from "effect"
import { HttpClient } from "effect/http"
import { Database } from "../archive"
import { withUserAgent } from "./user-agent"
import { Background } from "../background"
import { Cache } from "../cache"
import { cacheKeys, cacheTtl } from "../cache-policy"
import type { Cached } from "../cache"
import { snapshotFromRanked } from "../player-writes"
import { makeUpstream } from "@crh/domain/upstream/client"
import { mergePlayerRanked } from "@crh/domain/upstream/v1"
import type { V1Error } from "@crh/domain/upstream/v1"
import type { V1UpstreamShape } from "@crh/domain/upstream/client"
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

export type UpstreamShape = V1UpstreamShape

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

        return makeUpstream(withUserAgent(client))
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
        Cached<readonly (Ranking1v1 | Ranking2v2 | Ranking3v3)[]>,
        V1Error
    >
    /** Career stats only. Clan is a separate read so the crawler can warm this half. */
    readonly getPlayerStatsCore: (
        playerId: number,
    ) => Effect.Effect<Cached<PlayerStats | null>, V1Error>
    /** Career stats with the membership merged when it is available. */
    readonly getPlayerStats: (
        playerId: number,
    ) => Effect.Effect<Cached<PlayerStats | null>, V1Error>
    readonly getPlayerClan: (
        playerId: number,
    ) => Effect.Effect<Cached<PlayerStats["clan"] | null>, V1Error>
    readonly getPlayerRanked1v1: (
        playerId: number,
    ) => Effect.Effect<Cached<PlayerRanked | null>, V1Error>
    readonly getPlayerTeams: (
        playerId: number,
    ) => Effect.Effect<Cached<PlayerRanked["2v2"]>, V1Error>
    readonly getPlayerRanked: (
        playerId: number,
    ) => Effect.Effect<Cached<PlayerRanked | null>, V1Error>
    readonly getPlayer3v3Ranked: (
        playerId: number,
    ) => Effect.Effect<Cached<Player3v3Ranked | null>, V1Error>
    readonly getClan: (
        clanId: number,
    ) => Effect.Effect<Cached<Clan | null>, V1Error>
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

        const statsCore = (playerId: number) =>
            cache.getOrSetCached(
                cacheKeys.playerStats(playerId),
                cacheTtl.profile,
                upstream
                    .getPlayerStats(playerId)
                    .pipe(
                        Effect.tap((value) =>
                            value === null
                                ? Effect.void
                                : background.run(
                                      database.upsertPlayerStats(value, null),
                                  ),
                        ),
                    ),
            )

        const clan = (playerId: number) =>
            cache.getOrSetCached(
                cacheKeys.playerClan(playerId),
                cacheTtl.profile,
                upstream.getPlayerClan(playerId),
            )

        // Archive writes run on cache miss/refresh only — not on every read.
        return {
            getRankings: (bracket, region, page, name) =>
                cache.getOrSetCached(
                    cacheKeys.leaderboard(bracket, region, page, name),
                    cacheTtl.leaderboard,
                    upstream.getRankings(bracket, region, page, name),
                ),

            getPlayerStatsCore: statsCore,

            getPlayerStats: (playerId) =>
                Effect.gen(function* () {
                    const stats = yield* statsCore(playerId)

                    if (stats.value === null) return stats

                    // Membership is enrichment: a failed read leaves the card out,
                    // it does not take the profile down.
                    const membership = yield* clan(playerId).pipe(Effect.result)

                    if (membership._tag === "Failure") return stats

                    return {
                        value:
                            membership.success.value === null
                                ? stats.value
                                : {
                                      ...stats.value,
                                      clan: membership.success.value,
                                  },
                        updatedAt: Math.min(
                            stats.updatedAt,
                            membership.success.updatedAt,
                        ),
                    }
                }),

            getPlayerClan: clan,

            getPlayerRanked1v1: (playerId) =>
                cache.getOrSetCached(
                    cacheKeys.playerRanked1v1(playerId),
                    cacheTtl.profile,
                    upstream.getPlayerRanked1v1(playerId),
                ),

            getPlayerTeams: (playerId) =>
                cache.getOrSetCached(
                    cacheKeys.playerTeams(playerId),
                    cacheTtl.profile,
                    upstream.getPlayerTeams(playerId),
                ),

            getPlayerRanked: (playerId) =>
                Effect.gen(function* () {
                    const [account, teams] = yield* Effect.all(
                        [
                            cache.getOrSetCached(
                                cacheKeys.playerRanked1v1(playerId),
                                cacheTtl.profile,
                                upstream.getPlayerRanked1v1(playerId),
                            ),
                            cache.getOrSetCached(
                                cacheKeys.playerTeams(playerId),
                                cacheTtl.profile,
                                upstream.getPlayerTeams(playerId),
                            ),
                        ],
                        { concurrency: 2 },
                    )

                    const ranked = mergePlayerRanked(account.value, teams.value)

                    const snapshot =
                        ranked === null ? null : snapshotFromRanked(ranked)

                    if (ranked !== null && snapshot !== null) {
                        yield* background.run(
                            database.upsertPlayerRanked(
                                {
                                    id: ranked.brawlhalla_id.toString(),
                                    name: ranked.name,
                                },
                                snapshot,
                            ),
                        )
                    }

                    return {
                        value: ranked,
                        updatedAt: Math.min(account.updatedAt, teams.updatedAt),
                    }
                }),

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
