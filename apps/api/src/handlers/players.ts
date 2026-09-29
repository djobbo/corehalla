import { Effect } from "effect"
import { HttpApiBuilder, HttpApiError } from "effect/unstable/httpapi"
import { getTeamPlayers } from "@crh/bhapi/helpers/getTeamPlayers"
import { CorehallaApi } from "@crh/api-contract/Api"
import { Brawlhalla } from "@crh/core/services/upstream"
import { Database, searchKey } from "@crh/core/services/archive"
import { Background } from "@crh/core/services/background"
import { aliasRows } from "../helpers/aliases"
import { buildPlayer } from "../aggregate/player"

/**
 * The player profile, in one request.
 *
 * The page used to cost four: career stats, v0 ranked, v1 3v3 and the alias
 * index — and then the browser rolled the legends and weapons up itself. All of
 * that happens here, so the client renders a settled payload.
 *
 * The reads are genuinely independent, so they run concurrently. The alias
 * index is the exception to "fail loudly": it is decorative, and a database
 * problem must not take a profile down, so it degrades to "no aliases".
 *
 * The clan card needs a second upstream read (`/guild/stats` + `/guild/members`)
 * because `/player/guild` carries the membership but nothing about the guild —
 * no creation date, no roster size. It is fetched only when the player is in a
 * clan, and it degrades to `null` rather than failing the profile: the card is
 * enrichment, the profile is the page.
 */
export const playersGroup = HttpApiBuilder.group(
    CorehallaApi,
    "players",
    Effect.fnUntraced(function* (handlers) {
        const brawlhalla = yield* Brawlhalla
        const db = yield* Database
        const background = yield* Background

        return handlers.handle("getPlayer", ({ params }) =>
            Effect.gen(function* () {
                const stats = yield* brawlhalla.getPlayerStats(params.playerId)

                if (stats === null) {
                    return yield* new HttpApiError.NotFound()
                }

                const [ranked, ranked3v3, aliases, clan] = yield* Effect.all(
                    [
                        brawlhalla.getPlayerRanked(params.playerId),
                        brawlhalla.getPlayer3v3Ranked(params.playerId),
                        db
                            .getPlayerAliases(String(params.playerId))
                            .pipe(
                                Effect.catch(() =>
                                    Effect.succeed([] as readonly string[]),
                                ),
                            ),
                        stats.clan
                            ? brawlhalla
                                  .getClan(stats.clan.clan_id)
                                  .pipe(
                                      Effect.catch(() =>
                                          Effect.succeed(null),
                                      ),
                                  )
                            : Effect.succeed(null),
                    ],
                    { concurrency: 4 },
                )

                /*
                 * The player's own name, plus every 2v2 partner's.
                 *
                 * The partner half is not decoration: alias rows are written
                 * *only* here — neither the gateway's `upsertPlayerStats` nor the
                 * crawler touches `BHPlayerAlias` — so this is the only way a
                 * teammate seen on a profile becomes searchable. It used to be
                 * the ranked endpoint's job, and the aggregate has to carry it
                 * now that a profile view no longer calls that endpoint.
                 *
                 * `aliasRows` drops the zero-id sentinel of a solo-queue row, so
                 * spreading the pair is safe whether or not a real partner is
                 * present.
                 */
                const rankedAliases = [
                    ...aliasRows({
                        id: stats.brawlhalla_id,
                        name: stats.name,
                    }),
                    ...(ranked?.["2v2"] ?? [])
                        .map(getTeamPlayers)
                        .flat()
                        .flatMap((player) => aliasRows(player)),
                ]

                yield* background.run(db.upsertPlayerAliases(rankedAliases))

                if (stats.clan) {
                    yield* background.run(
                        db.upsertClan({
                            id: stats.clan.clan_id.toString(),
                            name: stats.clan.clan_name,
                            nameLower: searchKey(stats.clan.clan_name),
                            xp: parseInt(stats.clan.clan_xp),
                        }),
                    )
                }

                return buildPlayer(
                    { stats, ranked, ranked3v3, aliases, clan },
                    Date.now(),
                )
            }),
        )
    }),
)
