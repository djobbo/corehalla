import { Effect } from "effect"
import { HttpApiBuilder, HttpApiError } from "effect/unstable/httpapi"
import { getTeamPlayers } from "@crh/bhapi/helpers/getTeamPlayers"
import { CorehallaApi } from "@crh/api-contract/Api"
import { Brawlhalla } from "@crh/core/services/upstream"
import { Database, searchKey } from "@crh/core/services/archive"
import { Background } from "@crh/core/services/background"
import { aliasRows } from "../helpers/aliases"
import { buildPlayer } from "../aggregate/player"
import { PlayerEsports } from "../services/player-esports"
import type { Clan } from "@crh/bhapi/types"

export const playersGroup = HttpApiBuilder.group(
    CorehallaApi,
    "players",
    Effect.fnUntraced(function* (handlers) {
        const brawlhalla = yield* Brawlhalla
        const db = yield* Database
        const background = yield* Background
        const playerEsports = yield* PlayerEsports

        return handlers
            .handle("getPlayer", ({ params }) =>
                Effect.gen(function* () {
                    const [stats, ranked, ranked3v3] = yield* Effect.all(
                        [
                            brawlhalla.getPlayerStats(params.playerId),
                            brawlhalla.getPlayerRanked(params.playerId),
                            brawlhalla.getPlayer3v3Ranked(params.playerId),
                        ],
                        { concurrency: 3 },
                    )

                    if (stats.value === null) {
                        return yield* new HttpApiError.NotFound()
                    }

                    // Needs guild id from stats; enrichment only — failure → absent card.
                    const clan: {
                        readonly value: Clan | null
                        readonly updatedAt: number
                    } | null = stats.value.clan
                        ? yield* brawlhalla
                              .getClan(stats.value.clan.clan_id)
                              .pipe(Effect.catch(() => Effect.succeed(null)))
                        : null

                    const aliases = yield* db
                        .getPlayerAliases(String(params.playerId))
                        .pipe(
                            Effect.catch(() =>
                                Effect.succeed([] as readonly string[]),
                            ),
                        )

                    // Only write site for BHPlayerAlias (self + 2v2 partners); `aliasRows` drops solo-queue zero ids.
                    const rankedAliases = [
                        ...aliasRows({
                            id: stats.value.brawlhalla_id,
                            name: stats.value.name,
                        }),
                        ...(ranked.value?.["2v2"] ?? [])
                            .map(getTeamPlayers)
                            .flat()
                            .flatMap((player) => aliasRows(player)),
                    ]

                    yield* background.run(db.upsertPlayerAliases(rankedAliases))

                    if (stats.value.clan) {
                        const membership = stats.value.clan

                        yield* background.run(
                            db.upsertClan({
                                id: membership.clan_id.toString(),
                                name: membership.clan_name,
                                nameLower: searchKey(membership.clan_name),
                                xp: parseInt(membership.clan_xp),
                            }),
                        )
                    }

                    // Oldest upstream part, not assembly time.
                    const updatedAt = Math.min(
                        stats.updatedAt,
                        ranked.updatedAt,
                        ranked3v3.updatedAt,
                        ...(clan === null ? [] : [clan.updatedAt]),
                    )

                    return buildPlayer(
                        {
                            stats: stats.value,
                            ranked: ranked.value,
                            ranked3v3: ranked3v3.value,
                            aliases,
                            clan: clan?.value ?? null,
                        },
                        updatedAt,
                    )
                }),
            )
            .handle("getPlayerEsports", ({ params }) =>
                playerEsports.get(params.playerId).pipe(
                    Effect.map((result) => ({
                        data: result.value,
                        meta: { updated_at: result.updatedAt },
                    })),
                ),
            )
    }),
)
