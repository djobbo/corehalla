import { Context, Effect, Layer } from "effect"
import { HttpClient } from "effect/unstable/http"
import { Database } from "../archive"
import { Cache } from "../cache"
import { cacheKeys, cacheTtl } from "../cache-policy"
import { legacyOps } from "./legacy"
import {
    isCompleteClan,
    isCompleteLeaderboard,
    isCompletePlayer3v3Ranked,
    isCompletePlayerStats,
    toClan,
    toPlayer3v3Ranked,
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
    readonly getPlayerStats: (
        playerId: number,
    ) => Effect.Effect<PlayerStats | null>
    readonly getPlayerRanked: (
        playerId: number,
    ) => Effect.Effect<PlayerRanked | null>
    readonly getPlayer3v3Ranked: (
        playerId: number,
    ) => Effect.Effect<Player3v3Ranked | null>
    readonly getClan: (clanId: number) => Effect.Effect<Clan | null>
}

/**
 * Unaugmented upstream reads: v1 first, v0 when v1 cannot serve, no cache.
 *
 * Split out from {@link Brawlhalla} because the two callers want opposite
 * things from the same source selection:
 *
 * - **Request traffic** wants the cache and the budget damper.
 * - **The crawler** wants neither. It is the authoritative refresh path, so
 *   serving it a cached page would mean never actually re-reading the ladder,
 *   and the budget damper would throttle the very work that keeps the tables
 *   current — the crawler would consume the same allowance it exists to
 *   protect.
 *
 * Keeping selection here means the fallback rules stay in one place; only the
 * caching differs between the two services.
 */
export class Upstream extends Context.Service<Upstream, UpstreamShape>()(
    "app/Upstream",
) {}

export const rawLayer = Layer.effect(
    Upstream,
    Effect.gen(function* () {
        const client = yield* HttpClient.HttpClient
        const database = yield* Database

        const legacy = legacyOps(client)
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

                    // A 1v1 row is one player and a 2v2 row is the pair. 3v3 is
                    // also one player per row: it is a solo queue whose teams
                    // are assembled per match. Verified against the live
                    // endpoint — assuming a trio here is what made 3v3 return an
                    // empty ladder.
                    const playersPerRow = bracket === "2v2" ? 2 : 1

                    if (
                        board !== null &&
                        isCompleteLeaderboard(board, playersPerRow)
                    ) {
                        if (bracket === "1v1") {
                            return toRankings1v1(board.rankings)
                        }

                        return bracket === "2v2"
                            ? toRankings2v2(board.rankings)
                            : toRankings3v3(board.rankings)
                    }

                    // 3v3 has no fallback: the legacy API exposes no 3v3 mode
                    // at all, so there is nothing to fall back *to*. An
                    // incomplete page is an empty page rather than an error —
                    // v1 having a bad moment should not 500 the ladder.
                    if (bracket === "3v3") {
                        yield* Effect.logDebug(
                            `v1 could not serve 3v3 rankings ` +
                                `(${region} page ${page}); no v0 source exists`,
                        )

                        return []
                    }

                    yield* Effect.logDebug(
                        `v1 could not serve ${bracket} rankings ` +
                            `(${region} page ${page}); falling back to v0`,
                    )

                    return yield* legacy.getRankings(
                        bracket,
                        region,
                        page,
                        name,
                    )
                }),

            getPlayerStats: (playerId) =>
                Effect.gen(function* () {
                    const stats = yield* v1.getPlayerStats(playerId, "all")

                    // A null here is either "no such player" or "v1 failed"; v0
                    // answers both, so it takes the request rather than us
                    // guessing wrong and 404ing a player who exists.
                    if (stats === null || !isCompletePlayerStats(stats)) {
                        yield* Effect.logDebug(
                            `v1 could not serve player ${playerId}; ` +
                                `falling back to v0`,
                        )

                        return yield* legacy.getPlayerStats(playerId)
                    }

                    const membership = yield* v1.getPlayerGuild(playerId)
                    const guild = membership?.guild

                    // Without a real `clan_xp` there is no clan card to render:
                    // the contribution stat divides by it, so a placeholder
                    // would surface as `Infinity%`. A storage failure is treated
                    // like a missing row — the card is decorative and the
                    // profile must not fail for it.
                    const clanXp = guild
                        ? yield* database
                              .getClanXp(String(guild.guild_id))
                              .pipe(Effect.catch(() => Effect.succeed(null)))
                        : null

                    return toPlayerStats(
                        stats,
                        guild && clanXp
                            ? {
                                  clan_name: guild.guild_name,
                                  clan_id: guild.guild_id,
                                  clan_xp: clanXp,
                                  personal_xp: guild.personal_xp,
                              }
                            : undefined,
                    )
                }),

            // No v1 equivalent: v1 exposes no 2v2 ranked mode.
            getPlayerRanked: (playerId) => legacy.getPlayerRanked(playerId),

            /*
             * The mirror image of `getPlayerRanked`: 3v3 exists *only* in v1,
             * because the legacy API has no 3v3 mode at all. So there is no
             * fallback to attempt and no second source to disagree with — a
             * null means v1 could not answer, and the profile's 3v3 card treats
             * that as "no record" rather than as a failed page.
             */
            getPlayer3v3Ranked: (playerId) =>
                Effect.gen(function* () {
                    const stats = yield* v1.getPlayer3v3Stats(playerId)

                    if (stats === null || !isCompletePlayer3v3Ranked(stats)) {
                        yield* Effect.logDebug(
                            `v1 could not serve 3v3 ranked for player ` +
                                `${playerId}; no v0 source exists`,
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

                    yield* Effect.logDebug(
                        `v1 could not serve guild ${clanId}; falling back to v0`,
                    )

                    return yield* legacy.getClan(clanId)
                }),
        }
    }),
)

/**
 * The upstream gateway for request traffic: `Upstream` behind the read-through
 * cache and the refresh damper.
 *
 * | Operation         | Source           | Gap |
 * | ----------------- | ---------------- | --- |
 * | `getRankings`     | v1 (v0 fallback) | v1 rows have no `best_legend`, so the 1v1 legend icon is dropped. Accepted: the row still renders (`{legend && …}`) and that is the field's only reader. |
 * | `getPlayerStats`  | v1 (v0 fallback) | v1 moved the clan to `/player/guild`, which has no `clan_xp`; filled from our own `BHClan` row. |
 * | `getPlayerRanked` | v0 only          | v1 has no 2v2 mode, so the profile's "2v2 Ranked" tab has no v1 source. An absent endpoint, not a missing field. |
 * | `getPlayer3v3Ranked` | v1 only       | The mirror of `getPlayerRanked`: the legacy API has no 3v3 mode, so there is no fallback. v1 also reports the top tier as `null` and ranks only via a per-region `region_ranks` list, which is dropped. |
 * | `getClan`         | v1 (v0 fallback) | None: `/guild/stats` + `/guild/members` covers every field `Clan` has. |
 */
export class Brawlhalla extends Context.Service<Brawlhalla, UpstreamShape>()(
    "app/Brawlhalla",
) {}

/**
 * The cached gateway.
 *
 * Requires `Upstream` and `Cache` rather than providing them, so a caller that
 * also needs `Upstream` directly — the lookup federates over it — can build one
 * instance and share it, instead of standing up a second behind this service's
 * back.
 */
export const layer = Layer.effect(
    Brawlhalla,
    Effect.gen(function* () {
        const cache = yield* Cache
        const upstream = yield* Upstream

        return {
            getRankings: (bracket, region, page, name) =>
                cache.getOrSet(
                    cacheKeys.leaderboard(bracket, region, page, name),
                    cacheTtl.leaderboard,
                    upstream.getRankings(bracket, region, page, name),
                ),

            getPlayerStats: (playerId) =>
                cache.getOrSet(
                    cacheKeys.player(playerId),
                    cacheTtl.profile,
                    upstream.getPlayerStats(playerId),
                ),

            getPlayerRanked: (playerId) =>
                cache.getOrSet(
                    cacheKeys.playerRanked(playerId),
                    cacheTtl.profile,
                    upstream.getPlayerRanked(playerId),
                ),

            getPlayer3v3Ranked: (playerId) =>
                cache.getOrSet(
                    cacheKeys.player3v3Ranked(playerId),
                    cacheTtl.profile,
                    upstream.getPlayer3v3Ranked(playerId),
                ),

            getClan: (clanId) =>
                cache.getOrSet(
                    cacheKeys.clan(clanId),
                    cacheTtl.profile,
                    upstream.getClan(clanId),
                ),
        }
    }),
)
