import { Effect } from "effect"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { getTeamPlayers } from "@crh/bhapi/helpers/getTeamPlayers"
import { CorehallaApi } from "@crh/api-contract/Api"
import { Brawlhalla } from "@crh/core/services/upstream"
import { Database, searchKey } from "@crh/core/services/archive"
import { Background } from "@crh/core/services/background"
import { aliasRows } from "../helpers/aliases"
import type { Ranking1v1, Ranking2v2, Ranking3v3 } from "@crh/bhapi/types"

export const upstreamGroup = HttpApiBuilder.group(
    CorehallaApi,
    "upstream",
    Effect.fnUntraced(function* (handlers) {
        const brawlhalla = yield* Brawlhalla
        const db = yield* Database
        const background = yield* Background

        return (
            handlers
                .handle("getPlayerStats", ({ params }) =>
                    Effect.gen(function* () {
                        const { value: stats } =
                            yield* brawlhalla.getPlayerStats(params.playerId)

                        if (!stats) return null

                        yield* background.run(
                            db.upsertPlayerAliases(
                                aliasRows({
                                    id: stats.brawlhalla_id,
                                    name: stats.name,
                                }),
                            ),
                        )

                        if (stats.clan) {
                            const clan = stats.clan
                            yield* background.run(
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
                        const { value: ranked } =
                            yield* brawlhalla.getPlayerRanked(params.playerId)

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

                        yield* background.run(
                            db.upsertPlayerAliases(rankedAliases),
                        )

                        return ranked
                    }),
                )
                .handle("getPlayer3v3Ranked", ({ params }) =>
                    Effect.gen(function* () {
                        const { value: ranked } =
                            yield* brawlhalla.getPlayer3v3Ranked(
                                params.playerId,
                            )

                        if (!ranked) return null

                        yield* background.run(
                            db.upsertPlayerAliases(
                                aliasRows({
                                    id: ranked.brawlhalla_id,
                                    name: ranked.name,
                                }),
                            ),
                        )

                        return ranked
                    }),
                )
                .handle("getPlayerAliases", ({ params }) =>
                    // Decorative: a DB failure must not take the page down.
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
                        const { value: clan } = yield* brawlhalla.getClan(
                            params.clanId,
                        )

                        if (!clan) return null

                        yield* background.run(
                            db.upsertClan({
                                id: clan.clan_id.toString(),
                                name: clan.clan_name,
                                nameLower: searchKey(clan.clan_name),
                                created: clan.clan_create_date,
                                xp: parseInt(clan.clan_xp),
                            }),
                        )

                        yield* background.run(
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
                .handle("get1v1Rankings", ({ query }) =>
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

                        return rankings
                    }),
                )
                .handle("get2v2Rankings", ({ query }) =>
                    Effect.gen(function* () {
                        const board = yield* brawlhalla.getRankings(
                            "2v2",
                            query.region,
                            query.page,
                        )

                        return board.value as readonly Ranking2v2[]
                    }),
                )
                // v1-only: no legacy fallback; incomplete page → empty ladder.
                .handle("get3v3Rankings", ({ query }) =>
                    Effect.gen(function* () {
                        const board = yield* brawlhalla.getRankings(
                            "3v3",
                            query.region,
                            query.page,
                        )

                        return board.value as readonly Ranking3v3[]
                    }),
                )
        )
    }),
)
