import { Effect } from "effect"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { getTeamPlayers } from "@crh/bhapi/helpers/getTeamPlayers"
import { CorehallaApi } from "@crh/api-contract/Api"
import { Brawlhalla } from "@crh/core/services/upstream"
import { Content } from "./services/content"
import { Database, searchKey } from "@crh/core/services/archive"
import { Lookup } from "@crh/core/services/lookup"
import type { BHPlayerAlias } from "@crh/db/schema"
import type {
    Ranking1v1,
    Ranking2v2,
    Ranking3v3,
} from "@crh/bhapi/types"

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
 *
 * Exported for its test. It is the unit that took `GET /api/v1/stats/clan/9`
 * down, and the guard below is the kind of thing that reads as obviously fine
 * until it is pointed at a payload where the field is simply absent.
 */
export const aliasRows = (player: {
    readonly id: string | number
    /**
     * Optional because every name reaching this function comes from unvalidated
     * upstream JSON: a guild member v1 could not name, or the absent half of a
     * 2v2 `teamname` with no `+`.
     */
    readonly name: string | undefined
}): BHPlayerAlias[] => {
    const { id, name } = player

    // The load-bearing check, and the one whose absence was a production 500.
    // `searchKey` calls `.trim()`, so a missing name threw a `TypeError` out of
    // the handler and took the whole endpoint down — which is exactly what
    // `GET /api/v1/stats/clan/9` did, because v1 intermittently omits the `name`
    // key on guild members. This is also the only place the value can be
    // narrowed, since a boolean guard cannot teach the compiler that a field is
    // present: upstream JSON makes "this is a string" an assumption at this
    // boundary, never a fact. A name we cannot use is a row we skip, not a
    // request we fail.
    if (typeof name !== "string") return []

    if (!isStorableAlias(id, name)) return []

    const seenAt = new Date()

    return [
        {
            playerId: id.toString(),
            alias: name,
            aliasLower: searchKey(name),
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
            // v1-only: the legacy API has no 3v3 mode, so there is no fallback
            // source and an incomplete v1 page surfaces as an empty ladder.
            .handle("get3v3Rankings", ({ query }) =>
                Effect.gen(function* () {
                    return (yield* brawlhalla.getRankings(
                        "3v3",
                        query.region,
                        query.page,
                    )) as readonly Ranking3v3[]
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
        const lookup = yield* Lookup

        return handlers
            // The raw local alias index, kept for the existing search surface.
            .handle("searchPlayerAlias", ({ query }) =>
                db.searchAliases(query.alias, query.page).pipe(Effect.orDie),
            )
            // The federated lookup. Never fails: each source degrades to "no
            // results", because a partial answer beats an error on a
            // jump-to-result interaction.
            .handle("lookup", ({ query }) =>
                lookup.search(query.q, query.limit),
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
