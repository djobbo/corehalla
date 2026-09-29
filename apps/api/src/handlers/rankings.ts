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

const entryMembers = (entry: {
    readonly entry_id: string
    readonly name_one: string
    readonly name_two: string | null
    readonly member_one_id: string | null
    readonly member_two_id: string | null
}): readonly {
    readonly id: string
    readonly name: string
    readonly slug: string
}[] => {
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
                        const board = yield* brawlhalla.getRankings(
                            "1v1",
                            query.region,
                            query.page,
                            query.name,
                        )
                        const rankings = board.value as readonly Ranking1v1[]

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

                        // v1 dropped `best_legend`; one batched archive read, miss → null not fail.
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
                            board.updatedAt,
                        )
                    }),
                )
                .handle("getRanked2v2", ({ query }) =>
                    Effect.gen(function* () {
                        const board = yield* brawlhalla.getRankings(
                            "2v2",
                            query.region,
                            query.page,
                        )
                        const rankings = board.value as readonly Ranking2v2[]

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

                        return buildRankings2v2(rankings, board.updatedAt)
                    }),
                )
                // v1-only: no legacy fallback; incomplete page → empty ladder.
                .handle("getRanked3v3", ({ query }) =>
                    Effect.gen(function* () {
                        const board = yield* brawlhalla.getRankings(
                            "3v3",
                            query.region,
                            query.page,
                        )
                        const rankings = board.value as readonly Ranking3v3[]

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

                        return buildRankings3v3(rankings, board.updatedAt)
                    }),
                )
                .handle("getGlobalPlayerRankings", ({ query }) =>
                    db.getGlobalPlayerRankings(query.sortBy, query.page).pipe(
                        Effect.orDie,
                        Effect.map((rows) =>
                            rows.map((row) => ({
                                ...row,
                                slug: getEntitySlug(row.id, row.name),
                            })),
                        ),
                    ),
                )
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

                        // Query excludes null `queuedAt`; branch is unreachable — avoid `?? 0` → 1970.
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
                    db.getClansRankings(query.name, query.page).pipe(
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
