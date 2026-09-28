import { Context, Effect, Layer } from "effect"
import { HttpClient } from "effect/unstable/http"
import { Database } from "../archive"
import { Background } from "../background"
import { Cache } from "../cache"
import { cacheKeys, cacheTtl } from "../cache-policy"
import { legacyOps } from "./legacy"
import { snapshotFromRanked } from "../player-writes"
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
    /**
     * The player's career stats, and the clan card that goes with them.
     *
     * `withClan: false` is the **crawl** path's read and only its. Assembling
     * the card costs a second upstream request (`/v1/player/guild`) plus a look
     * up of our own clan XP, and the archive never stores it —
     * `upsertPlayerStats` writes the career half, the legends and the weapons
     * and drops `clan` on the floor. Paying a request per crawled player for a
     * value that is discarded made a full ladder pass ~4,030 requests instead
     * of the ~2,530 the crawl's budget is sized for, which is what ran the
     * crawl queue at more than one consumer-invocation's worth of work.
     *
     * The request path must leave the option unset: a profile renders the clan
     * card, and a crawl-warmed entry without it would be served as though the
     * player had no clan at all.
     */
    readonly getPlayerStats: (
        playerId: number,
        options?: { readonly withClan?: boolean },
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

            getPlayerStats: (playerId, options) =>
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

                    /*
                     * The crawl stops here, one request in.
                     *
                     * Its caller writes the career stats, the legends and the
                     * weapons into the archive, and none of those are the clan
                     * card — so the guild read below would be spent on a value
                     * that is thrown away. The card is the profile's, and the
                     * profile asks for it on its own path.
                     */
                    if (options?.withClan === false) {
                        return toPlayerStats(stats, undefined)
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
        const database = yield* Database
        const background = yield* Background

        /**
         * Whether there is anything new to write.
         *
         * The write belongs on the *refresh* path, not the read path, and that
         * is the difference between one write per five minutes and one per
         * view. A request served from cache has learned nothing new, so writing
         * again would re-issue the same rows for data the archive already holds
         * — a popular profile would run a full upsert (a player row, three
         * legends and three weapons) every time anybody opened it. The cache
         * only runs the effect below on a miss, so the write cannot outpace the
         * read it came from.
         *
         * `null` means "the upstream could not answer" rather than "no such
         * player", so there is nothing to store and nothing to erase.
         */
        return {
            getRankings: (bracket, region, page, name) =>
                cache.getOrSet(
                    cacheKeys.leaderboard(bracket, region, page, name),
                    cacheTtl.leaderboard,
                    upstream.getRankings(bracket, region, page, name),
                ),

            /*
             * Both halves of the player row are written here rather than by the
             * handler, because only the refresh knows whether there is anything
             * new to write. `getPlayerStats` carries the career stats — the
             * row's stats half, plus the legend and weapon tables — and
             * `getPlayerRanked` carries the standing the other half is made of.
             */
            getPlayerStats: (playerId) =>
                cache.getOrSet(
                    cacheKeys.player(playerId),
                    cacheTtl.profile,
                    upstream
                        .getPlayerStats(playerId)
                        .pipe(
                            Effect.tap((stats) =>
                                stats === null
                                    ? Effect.void
                                    : background.run(
                                          database.upsertPlayerStats(
                                              stats,
                                              null,
                                          ),
                                      ),
                            ),
                        ),
                ),

            getPlayerRanked: (playerId) =>
                cache.getOrSet(
                    cacheKeys.playerRanked(playerId),
                    cacheTtl.profile,
                    upstream.getPlayerRanked(playerId).pipe(
                        Effect.tap((ranked) => {
                            if (ranked === null) return Effect.void

                            const snapshot = snapshotFromRanked(ranked)

                            // No 1v1 record is an ordinary answer rather than a
                            // failure — there is simply nothing to add.
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
