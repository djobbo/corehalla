import { Effect } from "effect"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { getTeamPlayers } from "bhapi/helpers/getTeamPlayers"
import { CorehallaApi } from "./Api"
import { Brawlhalla } from "./Brawlhalla"
import { Content } from "./Content"
import { Database } from "./Database"
import type { BHPlayerAlias } from "db/generated/client"
import type { Ranking1v1, Ranking2v2 } from "bhapi/types"

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

const alias = (playerId: string | number, name: string): BHPlayerAlias => ({
    playerId: playerId.toString(),
    alias: name,
    createdAt: new Date(),
    public: true,
})

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
                            rankings.map((player) =>
                                alias(player.brawlhalla_id, player.name),
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
                        db.upsertPlayerAliases([
                            alias(stats.brawlhalla_id, stats.name),
                        ]),
                    )

                    if (stats.clan) {
                        const clan = stats.clan
                        yield* fireAndForget(
                            db.upsertClan({
                                id: clan.clan_id.toString(),
                                name: clan.clan_name,
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

                    const aliases = [
                        alias(ranked.brawlhalla_id, ranked.name),
                        ...(ranked["2v2"] ?? [])
                            .map(getTeamPlayers)
                            .flat()
                            .map((player) => alias(player.id, player.name)),
                    ]

                    yield* fireAndForget(db.upsertPlayerAliases(aliases))

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
                            created: clan.clan_create_date,
                            xp: parseInt(clan.clan_xp),
                        }),
                    )

                    yield* fireAndForget(
                        db.upsertPlayerAliases(
                            clan.clan.map((member) =>
                                alias(member.brawlhalla_id, member.name),
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
