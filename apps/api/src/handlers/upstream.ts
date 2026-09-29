import { Effect } from "effect"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { getTeamPlayers } from "@crh/bhapi/helpers/getTeamPlayers"
import { CorehallaApi } from "@crh/api-contract/Api"
import { Brawlhalla } from "@crh/core/services/upstream"
import { Database, searchKey } from "@crh/core/services/archive"
import { Background } from "@crh/core/services/background"
import { aliasRows } from "../helpers/aliases"
import type {
    Clan,
    Ranking1v1,
    Ranking2v2,
    Ranking3v3,
} from "@crh/bhapi/types"

/**
 * Brawlhalla's own answers, verbatim.
 *
 * This is the old pass-through surface, moved under one prefix so the split
 * between "our product endpoints" and "Brawlhalla's payloads" is visible in the
 * URL. The handlers are otherwise unchanged: they still feed the alias and clan
 * indexes, because a client that asks for the raw payload has still told us
 * that this player exists, and dropping that write would make the raw surface
 * strictly worse than it was.
 *
 * A client should prefer the aggregate beside each of these. They exist for
 * parity and debugging — when an aggregate looks wrong, the way to tell whether
 * the bug is ours or upstream's is to ask for the raw payload next to it.
 */
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
                        const stats = yield* brawlhalla.getPlayerStats(
                            params.playerId,
                        )

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

                        yield* background.run(
                            db.upsertPlayerAliases(rankedAliases),
                        )

                        return ranked
                    }),
                )
                /*
                 * 3v3 has no v0 fallback and no 2v2 payload to piggyback on, so it
                 * is its own read. It still feeds the alias index, which is what
                 * makes a renamed player findable after a profile view in *any*
                 * ranked mode rather than only in 1v1/2v2.
                 */
                .handle("getPlayer3v3Ranked", ({ params }) =>
                    Effect.gen(function* () {
                        const ranked = yield* brawlhalla.getPlayer3v3Ranked(
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
                    // Aliases are decorative: a database problem must not take the
                    // player page down.
                    db.getPlayerAliases(params.playerId.toString()).pipe(
                        Effect.catch(() =>
                            Effect.succeed([] as readonly string[]),
                        ),
                    ),
                )
                .handle("getClanStats", ({ params }) =>
                    Effect.gen(function* () {
                        const clan: Clan | null = yield* brawlhalla.getClan(
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
        )
    }),
)
