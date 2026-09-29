import { Effect } from "effect"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { getEntitySlug } from "@crh/common/helpers/entitySlug"
import { CorehallaApi } from "@crh/api-contract/Api"
import { Brawlhalla } from "@crh/core/services/upstream"
import { Database } from "@crh/core/services/archive"
import { Background } from "@crh/core/services/background"
import { RANKED_QUEUE_WINDOW_MS } from "@crh/core/constants"
import { Content } from "../services/content"
import { aliasRows } from "../helpers/aliases"
import {
    bestLegendIndex,
    buildRankings1v1,
    buildRankings2v2,
    buildRankings3v3,
} from "../aggregate/rankings"
import type { BestLegendRow } from "@crh/core/services/archive"
import type { Ranking1v1, Ranking2v2, Ranking3v3 } from "@crh/bhapi/types"

/**
 * Every board, product-shaped.
 *
 * Two families live here and they are sourced differently:
 *
 * - The **live ladders** (1v1, 2v2, 3v3) come from upstream and are reshaped
 *   into the row kubi's client renders — a slug, a team tuple, a best legend.
 * - The **career boards** (global, per legend, per weapon, clans) are ours:
 *   the crawler materialised them, so they already arrive as final rows and
 *   only need their URL segment.
 *
 * The queue sampler is neither, and is included because it is addressed the
 * same way — one bracket crossed with one region.
 */

/**
 * The players of a queue entry, as links.
 *
 * A solo ladder has one and a team has two, and both come from their own
 * columns — the entry's ids from the member fields, its names from the name
 * fields. Nothing here takes a joined string apart, which is the whole reason
 * the table stores two names in the first place.
 */
const entryMembers = (entry: {
    readonly entry_id: string
    readonly name_one: string
    readonly name_two: string | null
    readonly member_one_id: string | null
    readonly member_two_id: string | null
}): readonly { readonly id: string; readonly name: string; readonly slug: string }[] => {
    if (entry.member_one_id === null) {
        return [
            {
                id: entry.entry_id,
                name: entry.name_one,
                slug: getEntitySlug(entry.entry_id, entry.name_one),
            },
        ]
    }

    const members = [
        { id: entry.member_one_id, name: entry.name_one },
        { id: entry.member_two_id, name: entry.name_two ?? "" },
    ]

    return members.flatMap((member) =>
        member.id === null
            ? []
            : [
                  {
                      id: member.id,
                      name: member.name,
                      slug: getEntitySlug(member.id, member.name),
                  },
              ],
    )
}

export const rankingsGroup = HttpApiBuilder.group(
    CorehallaApi,
    "rankings",
    Effect.fnUntraced(function* (handlers) {
        const brawlhalla = yield* Brawlhalla
        const db = yield* Database
        const content = yield* Content
        const background = yield* Background

        return (
            handlers
                .handle("getRanked1v1", ({ query }) =>
                    Effect.gen(function* () {
                        const rankings = (yield* brawlhalla.getRankings(
                            "1v1",
                            query.region,
                            query.page,
                            query.name,
                        )) as readonly Ranking1v1[]

                        yield* background.run(
                            db.upsertPlayerAliases(
                                rankings.flatMap((player) =>
                                    aliasRows({
                                        id: player.brawlhalla_id,
                                        name: player.name,
                                    }),
                                ),
                            ),
                        )

                        /*
                         * v1 no longer sends `best_legend`, so the icon would
                         * be blank for every row. Our own legend table has it
                         * for the players the crawler has seen — which is the
                         * top of the ladder, exactly who appears here — and one
                         * batched read is cheaper than a request per row. A
                         * miss degrades to a null best legend rather than
                         * failing the board.
                         */
                        const best = yield* db
                            .getBestLegends(
                                rankings.map((row) =>
                                    String(row.brawlhalla_id),
                                ),
                            )
                            .pipe(
                                Effect.catch(() =>
                                    Effect.succeed(
                                        [] as readonly BestLegendRow[],
                                    ),
                                ),
                            )

                        return buildRankings1v1(
                            rankings,
                            bestLegendIndex(best),
                            Date.now(),
                        )
                    }),
                )
                .handle("getRanked2v2", ({ query }) =>
                    Effect.gen(function* () {
                        const rankings = (yield* brawlhalla.getRankings(
                            "2v2",
                            query.region,
                            query.page,
                        )) as readonly Ranking2v2[]

                        // A 2v2 row names two players and both are worth
                        // indexing: neither is "the" player of the row.
                        yield* background.run(
                            db.upsertPlayerAliases(
                                rankings.flatMap((row) => [
                                    ...aliasRows({
                                        id: row.brawlhalla_id_one,
                                        name: row.name_one,
                                    }),
                                    ...aliasRows({
                                        id: row.brawlhalla_id_two,
                                        name: row.name_two,
                                    }),
                                ]),
                            ),
                        )

                        return buildRankings2v2(rankings, Date.now())
                    }),
                )
                // v1-only: the legacy API has no 3v3 mode, so there is no
                // fallback source and an incomplete v1 page surfaces as an
                // empty ladder.
                .handle("getRanked3v3", ({ query }) =>
                    Effect.gen(function* () {
                        const rankings = (yield* brawlhalla.getRankings(
                            "3v3",
                            query.region,
                            query.page,
                        )) as readonly Ranking3v3[]

                        yield* background.run(
                            db.upsertPlayerAliases(
                                rankings.flatMap((player) =>
                                    aliasRows({
                                        id: player.brawlhalla_id,
                                        name: player.name,
                                    }),
                                ),
                            ),
                        )

                        return buildRankings3v3(rankings, Date.now())
                    }),
                )
                .handle("getGlobalPlayerRankings", ({ query }) =>
                    db
                        .getGlobalPlayerRankings(query.sortBy, query.page)
                        .pipe(
                            Effect.orDie,
                            // The archive stores the name but not the URL
                            // segment; the id is the identity, so the slug is
                            // finished at the edge where URLs belong.
                            Effect.map((rows) =>
                                rows.map((row) => ({
                                    ...row,
                                    slug: getEntitySlug(row.id, row.name),
                                })),
                            ),
                        ),
                )
                /*
                 * The two per-legend / per-weapon boards. Archive reads like
                 * the career one above: these are ours, not upstream, so there
                 * is nothing to fall back to and a database failure is a real
                 * failure rather than a reason to try somewhere else.
                 */
                .handle("getGlobalLegendRankings", ({ query }) =>
                    db
                        .getGlobalLegendRankings(
                            query.legendId,
                            query.sortBy,
                            query.page,
                        )
                        .pipe(
                            Effect.orDie,
                            Effect.map((rows) =>
                                rows.map((row) => ({
                                    ...row,
                                    slug: getEntitySlug(row.id, row.name),
                                })),
                            ),
                        ),
                )
                .handle("getGlobalWeaponRankings", ({ query }) =>
                    db
                        .getGlobalWeaponRankings(
                            query.weapon,
                            query.sortBy,
                            query.page,
                        )
                        .pipe(
                            Effect.orDie,
                            Effect.map((rows) =>
                                rows.map((row) => ({
                                    ...row,
                                    slug: getEntitySlug(row.id, row.name),
                                })),
                            ),
                        ),
                )
                .handle("getRankedQueue", ({ query }) =>
                    Effect.gen(function* () {
                        const since = new Date(
                            Date.now() - RANKED_QUEUE_WINDOW_MS,
                        )

                        const rows = yield* db
                            .getRankedQueue(query.bracket, query.region, since)
                            .pipe(Effect.orDie)

                        /*
                         * `queuedAt` is null for a player we have sampled but
                         * never seen play, and the query excludes those — the
                         * branch is unreachable rather than defensive, and
                         * saying so in the type beats a `?? 0` that would
                         * render as 1970 if it ever were reached.
                         */
                        return rows.flatMap((row) =>
                            row.queuedAt === null
                                ? []
                                : [
                                      {
                                          id: row.entry_id,
                                          members: entryMembers(row),
                                          rating: row.rating,
                                          peakRating: row.peakRating,
                                          tier: row.tier,
                                          games: row.games,
                                          wins: row.wins,
                                          queuedAt: row.queuedAt.getTime(),
                                          rank: row.rank,
                                          ratingDelta: row.ratingDelta,
                                          rankDelta: row.rankDelta,
                                      },
                                  ],
                        )
                    }),
                )
                .handle("getClansRankings", ({ query }) =>
                    db
                        .getClansRankings(query.name, query.page)
                        .pipe(
                            Effect.orDie,
                            Effect.map((rows) =>
                                rows.map((row) => ({
                                    ...row,
                                    slug: getEntitySlug(row.id, row.name),
                                })),
                            ),
                        ),
                )
                .handle("getPowerRankings", ({ query }) =>
                    content.getPowerRankings(query.bracket, query.region),
                )
        )
    }),
)
