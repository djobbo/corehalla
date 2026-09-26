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
 * Cache windows per resource, in seconds.
 *
 * `freshSeconds` is when a value stops being current; `staleSeconds` is how
 * long it is kept so the serve-stale path has something to return when the
 * upstream budget is spent.
 *
 * A ladder page moves constantly and is cheap to refetch, so it stays fresh for
 * a minute but lingers for fifteen. A player or guild profile changes slowly
 * and costs more to assemble (a v1 profile is up to two upstream calls), so it
 * stays fresh for the five minutes the old edge `Cache-Control` used and
 * lingers for an hour.
 */
const TTL = {
    leaderboard: { freshSeconds: 60, staleSeconds: 15 * 60 },
    profile: { freshSeconds: 300, staleSeconds: 60 * 60 },
} as const

type UpstreamShape = {
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

                    // A 1v1 row is one player and a 2v2 row is the pair; a page
                    // whose rows do not have that shape is not the ladder we
                    // asked for.
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

            getClan: (clanId) =>
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
 * | `getClan`         | v1 (v0 fallback) | None: `/guild/stats` + `/guild/members` covers every field `Clan` has. |
 */
export class Brawlhalla extends Context.Service<Brawlhalla, UpstreamShape>()(
    "app/Brawlhalla",
) {}

export const layer = Layer.effect(
    Brawlhalla,
    Effect.gen(function* () {
        const cache = yield* Cache
        const upstream = yield* Upstream

        return {
            getRankings: (bracket, region, page, name) =>
                cache.getOrSet(
                    `lb:${bracket}:${region}:${page}:${name ?? ""}`,
                    TTL.leaderboard,
                    upstream.getRankings(bracket, region, page, name),
                ),

            getPlayerStats: (playerId) =>
                cache.getOrSet(
                    `player:${playerId}`,
                    TTL.profile,
                    upstream.getPlayerStats(playerId),
                ),

            getPlayerRanked: (playerId) =>
                cache.getOrSet(
                    `player-ranked:${playerId}`,
                    TTL.profile,
                    upstream.getPlayerRanked(playerId),
                ),

            getClan: (clanId) =>
                cache.getOrSet(
                    `clan:${clanId}`,
                    TTL.profile,
                    upstream.getClan(clanId),
                ),
        }
    }),
).pipe(Layer.provide(rawLayer))
