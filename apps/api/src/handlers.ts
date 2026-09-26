import { Effect } from "effect"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { getTeamPlayers } from "@crh/bhapi/helpers/getTeamPlayers"
import { CorehallaApi } from "@crh/api-contract/Api"
import { Brawlhalla } from "./services/upstream"
import { Content } from "./services/content"
import { Database, searchKey } from "./services/archive"
import type { BHPlayerAlias } from "@crh/db/schema"
import type { Ranking1v1, Ranking2v2 } from "@crh/bhapi/types"

/**
 * Server implementations of the `CorehallaApi` contract.
 *
 * Services are captured in the *outer* group builder (`Effect.fnUntraced`
 * around `handlers`). Resolving a service inside an individual handler instead
 * would move it into `HttpRouter.Request<"Requires", …>`, which cannot be
 * discharged with `Layer.provide`.
 *
 * The database "warm the cache" writes the tRPC procedures fired and forgot are
 * kept as detached fibers so they never block the response.
 */

/** Runs a bookkeeping write without blocking the response. */
const fireAndForget = (effect: Effect.Effect<unknown, unknown>) =>
    Effect.forkDetach(effect.pipe(Effect.orDie))

/**
 * Whether an upstream row is worth storing as an alias.
 *
 * The Brawlhalla payloads use `0` as a "no player" sentinel, and occasionally
 * ship a blank name (a 2v2 `teamname` can split into an empty half). Storing
 * either would put a row in the alias indexes that no search can ever
 * meaningfully return, so they are dropped before they reach the database.
 *
 * A present-but-blank name is rejected via `searchKey`, which trims — that
 * keeps "   " from being stored as a searchable alias.
 */
const isStorableAlias = (playerId: string | number, name: string): boolean =>
    String(playerId) !== "0" && searchKey(name).length > 0

/**
 * Builds alias rows from an upstream player payload.
 *
 * `aliasLower` has to be computed here rather than by SQL `lower()`, which
 * does not fold non-ASCII. `searchKey` is the same folding the search needle
 * goes through, so stored keys and lookup keys always agree.
 *
 * `createdAt` and `lastSeen` are both "now" on insert; the upsert deliberately
 * only refreshes `lastSeen`, so `createdAt` keeps meaning "first seen".
 *
 * Returns an array so a filtered-out player contributes zero rows without every
 * caller repeating the guard — the handlers only ever spread this into
 * `upsertPlayerAliases`.
 */
const aliasRows = (player: {
    readonly id: string | number
    readonly name: string
}): BHPlayerAlias[] => {
    if (!isStorableAlias(player.id, player.name)) return []

    const seenAt = new Date()

    return [
        {
            playerId: player.id.toString(),
            alias: player.name,
            aliasLower: searchKey(player.name),
            createdAt: seenAt,
            lastSeen: seenAt,
            public: true,
        },
    ]
}

export const rankingsGroup = HttpApiBuilder.group(
    CorehallaApi,
    "rankings",
    Effect.fnUntraced(function* (handlers) {
        const brawlhalla = yield* Brawlhalla
        const db = yield* Database
        const content = yield* Content

        return handlers
            .handle("get1v1Rankings", ({ query }) =>
                Effect.gen(function* () {
                    const rankings = (yield* brawlhalla.getRankings(
                        "1v1",
                        query.region,
                        query.page,
                        query.name,
                    )) as readonly Ranking1v1[]

                    yield* fireAndForget(
                        db.upsertPlayerAliases(
                            rankings.flatMap((player) =>
                                aliasRows({
                                    id: player.brawlhalla_id,
                                    name: player.name,
                                }),
                            ),
                        ),
                    )

                    return rankings
                }),
            )
            .handle("get2v2Rankings", ({ query }) =>
                Effect.gen(function* () {
                    return (yield* brawlhalla.getRankings(
                        "2v2",
                        query.region,
                        query.page,
                    )) as readonly Ranking2v2[]
                }),
            )
            .handle("getGlobalPlayerRankings", ({ query }) =>
                db
                    .getGlobalPlayerRankings(query.sortBy, query.page)
                    .pipe(Effect.orDie),
            )
            .handle("getClansRankings", ({ query }) =>
                db.getClansRankings(query.name, query.page).pipe(Effect.orDie),
            )
            .handle("getPowerRankings", ({ query }) =>
                content.getPowerRankings(query.bracket, query.region),
            )
    }),
)

export const statsGroup = HttpApiBuilder.group(
    CorehallaApi,
    "stats",
    Effect.fnUntraced(function* (handlers) {
        const brawlhalla = yield* Brawlhalla
        const db = yield* Database

        return handlers
            .handle("getPlayerStats", ({ params }) =>
                Effect.gen(function* () {
                    const stats = yield* brawlhalla.getPlayerStats(
                        params.playerId,
                    )

                    if (!stats) return null

                    yield* fireAndForget(
                        db.upsertPlayerAliases(
                            aliasRows({
                                id: stats.brawlhalla_id,
                                name: stats.name,
                            }),
                        ),
                    )

                    if (stats.clan) {
                        const clan = stats.clan
                        yield* fireAndForget(
                            db.upsertClan({
                                id: clan.clan_id.toString(),
                                name: clan.clan_name,
                                nameLower: searchKey(clan.clan_name),
                                xp: parseInt(clan.clan_xp),
                            }),
                        )
                    }

                    return stats
                }),
            )
            .handle("getPlayerRanked", ({ params }) =>
                Effect.gen(function* () {
                    const ranked = yield* brawlhalla.getPlayerRanked(
                        params.playerId,
                    )

                    if (!ranked) return null

                    const rankedAliases = [
                        ...aliasRows({
                            id: ranked.brawlhalla_id,
                            name: ranked.name,
                        }),
                        ...(ranked["2v2"] ?? [])
                            .map(getTeamPlayers)
                            .flat()
                            .flatMap((player) => aliasRows(player)),
                    ]

                    yield* fireAndForget(db.upsertPlayerAliases(rankedAliases))

                    return ranked
                }),
            )
            .handle("getPlayerAliases", ({ params }) =>
                // Aliases are decorative: a database problem must not take the
                // player page down.
                db
                    .getPlayerAliases(params.playerId.toString())
                    .pipe(
                        Effect.catch(() =>
                            Effect.succeed([] as readonly string[]),
                        ),
                    ),
            )
            .handle("getClanStats", ({ params }) =>
                Effect.gen(function* () {
                    const clan = yield* brawlhalla.getClan(params.clanId)

                    if (!clan) return null

                    yield* fireAndForget(
                        db.upsertClan({
                            id: clan.clan_id.toString(),
                            name: clan.clan_name,
                            nameLower: searchKey(clan.clan_name),
                            created: clan.clan_create_date,
                            xp: parseInt(clan.clan_xp),
                        }),
                    )

                    yield* fireAndForget(
                        db.upsertPlayerAliases(
                            clan.clan.flatMap((member) =>
                                aliasRows({
                                    id: member.brawlhalla_id,
                                    name: member.name,
                                }),
                            ),
                        ),
                    )

                    return clan
                }),
            )
    }),
)

export const searchGroup = HttpApiBuilder.group(
    CorehallaApi,
    "search",
    Effect.fnUntraced(function* (handlers) {
        const db = yield* Database

        return handlers.handle("searchPlayerAlias", ({ query }) =>
            db.searchAliases(query.alias, query.page).pipe(Effect.orDie),
        )
    }),
)

export const contentGroup = HttpApiBuilder.group(
    CorehallaApi,
    "content",
    Effect.fnUntraced(function* (handlers) {
        const content = yield* Content

        return handlers
            .handle("getWeeklyRotation", () => content.getWeeklyRotation())
            .handle("getBHArticles", ({ query }) =>
                content.getArticles(query.category ?? "", query.first ?? 1),
            )
    }),
)
