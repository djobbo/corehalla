import { Effect } from "effect"
import { HttpApiBuilder, HttpApiError } from "effect/unstable/httpapi"
import { getTeamPlayers } from "@crh/bhapi/helpers/getTeamPlayers"
import { CorehallaApi } from "@crh/api-contract/Api"
import { Brawlhalla } from "@crh/core/services/upstream"
import { Database, searchKey } from "@crh/core/services/archive"
import { Background } from "@crh/core/services/background"
import { aliasRows } from "../helpers/aliases"
import { buildPlayer } from "../aggregate/player"
import type { Clan } from "@crh/bhapi/types"

/**
 * The player profile, in one request.
 *
 * The page used to cost four: career stats, v0 ranked, v1 3v3 and the alias
 * index — and then the browser rolled the legends and weapons up itself. All of
 * that happens here, so the client renders a settled payload.
 *
 * Every upstream read comes back with the time it was fetched, and the response
 * reports the **oldest** of them. A profile is assembled from four cache entries
 * with independent freshness, so stamping it with the moment of assembly would
 * claim the clan card is as current as the stats beside it; `meta.updated_at`
 * is the age of the least-current part.
 *
 * The alias index is the exception to "fail loudly": it is decorative, and a
 * database problem must not take a profile down, so it degrades to "no aliases".
 * The clan card is enrichment too — its absence is a shorter page, not a failed
 * one.
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

                /*
                 * The roster read needs the player's guild id, which only the
                 * stats payload carries — `/player/guild` gives the membership,
                 * `/guild/stats` + `/guild/members` give the guild. So it runs
                 * after rather than beside the other three. It is cached under
                 * its own key and is enrichment, so a failure is an absent card.
                 */
                const clan: { readonly value: Clan | null; readonly updatedAt: number } | null =
                    stats.value.clan
                        ? yield* brawlhalla
                              .getClan(stats.value.clan.clan_id)
                              .pipe(
                                  Effect.catch(() =>
                                      Effect.succeed(null),
                                  ),
                              )
                        : null

                const aliases = yield* db
                    .getPlayerAliases(String(params.playerId))
                    .pipe(
                        Effect.catch(() =>
                            Effect.succeed([] as readonly string[]),
                        ),
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

                /*
                 * The oldest part, not now. `getPlayerStats` has already folded
                 * its own clan *card* into that timestamp; this folds in the
                 * roster read.
                 */
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
    }),
)
