import { Context, Effect, Layer } from "effect"
import { HttpClient } from "effect/unstable/http"
import { Database } from "../archive"
import { Cache } from "../cache"
import { legacyOps } from "./legacy"
import {
    isCompleteClan,
    isCompleteLeaderboard,
    isCompletePlayerStats,
    toClan,
    toPlayerStats,
    toRankings1v1,
    toRankings2v2,
    v1Ops,
} from "./v1"
import type {
    Bracket,
    Clan,
    PlayerRanked,
    PlayerStats,
    Ranking1v1,
    Ranking2v2,
} from "@crh/bhapi/types"
import type { RankedRegion } from "@crh/bhapi/constants"

/**
 * Time-to-live for each cached resource, in seconds.
 *
 * A ladder page moves constantly and is cheap to refetch, so it is cached
 * briefly to absorb the request bursts a leaderboard gets. A player or guild
 * profile changes slowly and costs more to assemble (a v1 profile is up to two
 * upstream calls), so it is held for the five minutes the old edge
 * `Cache-Control` used.
 */
const TTL = {
    leaderboard: 60,
    profile: 300,
} as const

/**
 * The single upstream entry point.
 *
 * ## Which API serves which operation
 *
 * v1 serves everything it can, and v0 covers the rest. A v1 request is always
 * attempted first; the predicate then decides whether the *mapped domain object*
 * is good enough, and v0 takes the request when it is not:
 *
 * | Operation         | Source           | Gap |
 * | ----------------- | ---------------- | --- |
 * | `getRankings`     | v1 (v0 fallback) | v1 rows have no `best_legend`, so the 1v1 legend icon is dropped. Accepted: the row still renders (`{legend && …}`) and that is the field's only reader. |
 * | `getPlayerStats`  | v1 (v0 fallback) | v1 moved the clan to `/player/guild` and that payload has no `clan_xp`. Filled from our own `BHClan` row rather than a third upstream request; when the clan has never been seen the card is omitted rather than showing a wrong number. |
 * | `getPlayerRanked` | v0 only          | v1's modes are `all`/`ranked_1v1`/`ranked_3v3` — **there is no 2v2 mode**, so the profile's "2v2 Ranked" tab has no v1 source at all. An absent endpoint, not a missing field, so no local join can bridge it. |
 * | `getClan`         | v1 (v0 fallback) | None: `/guild/stats` + `/guild/members` covers every field `Clan` has, at the cost of 2 requests instead of v0's 1. |
 *
 * ## Caching
 *
 * Every operation is wrapped in a read-through cache, and the wrapper sits
 * *outside* the v1/v0 choice — the cached value is the final domain object, so
 * a hit skips the source decision entirely and no upstream request is made. The
 * side effect is that a transient v1 failure is cached as its v0 result for the
 * TTL; that is accepted, as the alternative is re-probing v1 on every request
 * for the whole TTL window.
 *
 * A rejected v1 result costs one wasted request before v0 answers, so every
 * fallback is logged at debug level and the rate can be watched.
 */
export class Brawlhalla extends Context.Service<
    Brawlhalla,
    {
        readonly getRankings: (
            bracket: Bracket,
            region: RankedRegion,
            page: number,
            name?: string,
        ) => Effect.Effect<readonly (Ranking1v1 | Ranking2v2)[]>
        readonly getPlayerStats: (
            playerId: number,
        ) => Effect.Effect<PlayerStats | null>
        readonly getPlayerRanked: (
            playerId: number,
        ) => Effect.Effect<PlayerRanked | null>
        readonly getClan: (clanId: number) => Effect.Effect<Clan | null>
    }
>()("app/Brawlhalla") {}

export const layer = Layer.effect(
    Brawlhalla,
    Effect.gen(function* () {
        // Capture the dependencies so the effects this service returns have no
        // remaining requirements.
        const client = yield* HttpClient.HttpClient
        const database = yield* Database
        const cache = yield* Cache

        const legacy = legacyOps(client)
        const v1 = v1Ops(client)

        return {
            getRankings: (bracket, region, page, name) =>
                cache.getOrSet(
                    `lb:${bracket}:${region}:${page}:${name ?? ""}`,
                    TTL.leaderboard,
                    Effect.gen(function* () {
                        const board = yield* v1.getLeaderboard(
                            bracket,
                            region,
                            page,
                            name,
                        )

                        // A 1v1 row is one player and a 2v2 row is the pair; a
                        // page whose rows do not have that shape is not the
                        // ladder we asked for.
                        const playersPerRow = bracket === "1v1" ? 1 : 2

                        if (
                            board !== null &&
                            isCompleteLeaderboard(board, playersPerRow)
                        ) {
                            return bracket === "1v1"
                                ? toRankings1v1(board.rankings)
                                : toRankings2v2(board.rankings)
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
                ),

            getPlayerStats: (playerId) =>
                cache.getOrSet(
                    `player:${playerId}`,
                    TTL.profile,
                    Effect.gen(function* () {
                        const stats = yield* v1.getPlayerStats(playerId, "all")

                        // A null here is either "no such player" or "v1
                        // failed"; v0 answers both, so it takes the request
                        // rather than us guessing wrong and 404ing a player who
                        // exists.
                        if (stats === null || !isCompletePlayerStats(stats)) {
                            yield* Effect.logDebug(
                                `v1 could not serve player ${playerId}; ` +
                                    `falling back to v0`,
                            )

                            return yield* legacy.getPlayerStats(playerId)
                        }

                        // Fetched through the cache as well: a profile view and
                        // a clan view otherwise ask v1 the same question twice.
                        const membership = yield* cache.getOrSet(
                            `player-guild:${playerId}`,
                            TTL.profile,
                            v1.getPlayerGuild(playerId),
                        )
                        const guild = membership?.guild

                        // Without a real `clan_xp` there is no clan card to
                        // render: the contribution stat divides by it, so a
                        // placeholder would surface as `Infinity%`. A storage
                        // failure is treated like a missing row — the card is
                        // decorative and the profile must not fail for it.
                        const clanXp = guild
                            ? yield* database
                                  .getClanXp(String(guild.guild_id))
                                  .pipe(
                                      Effect.catch(() =>
                                          Effect.succeed(null),
                                      ),
                                  )
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
                ),

            // No v1 equivalent: v1 exposes no 2v2 ranked mode.
            getPlayerRanked: (playerId) =>
                cache.getOrSet(
                    `player-ranked:${playerId}`,
                    TTL.profile,
                    legacy.getPlayerRanked(playerId),
                ),

            getClan: (clanId) =>
                cache.getOrSet(
                    `clan:${clanId}`,
                    TTL.profile,
                    Effect.gen(function* () {
                        const [guild, members] = yield* Effect.all(
                            [
                                v1.getGuildStats(clanId),
                                v1.getGuildMembers(clanId),
                            ],
                            { concurrency: 2 },
                        )

                        const clan = guild
                            ? toClan(guild, members?.guild_members ?? [])
                            : null

                        if (isCompleteClan(clan)) return clan

                        yield* Effect.logDebug(
                            `v1 could not serve guild ${clanId}; ` +
                                `falling back to v0`,
                        )

                        return yield* legacy.getClan(clanId)
                    }),
                ),
        }
    }),
)
