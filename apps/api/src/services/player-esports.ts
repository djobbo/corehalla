import { Context, Effect, Layer } from "effect"
import { getEntitySlug } from "@crh/common/helpers/entitySlug"
import { Cache } from "@crh/core/services/cache"
import { Brawltools } from "./brawltools"
import type * as B from "./brawltools/schemas"
import type { CacheWindow } from "@crh/core/services/cache-policy"
import type { Cached } from "@crh/core/services/cache"
import type {
    EsportsIdentity,
    EsportsPlacement,
    EsportsPr,
    EsportsTeammate,
    PlayerEsports as PlayerEsportsData,
} from "@crh/api-contract/schemas"

const esportsTtl: CacheWindow = {
    freshSeconds: 60 * 60,
    staleSeconds: 24 * 60 * 60,
}

const TEAMMATE_LIMIT = 12
const PLACEMENT_LIMIT = 12

const empty: PlayerEsportsData = {
    identity: null,
    pr: { "1v1": null, "2v2": null },
    recentLegend: null,
    teammates: [],
    placements: { "1v1": [], "2v2": [] },
}

const identityOf = (player: B.Player | undefined): EsportsIdentity | null =>
    player === undefined || player.playerId === null
        ? null
        : {
              esportsId: player.playerId,
              fullName: player.name ?? null,
              pronoun: player.pronoun ?? null,
              sggPlayerId: player.sggPlayerId ?? null,
              cmPlayerId: player.cmPlayerId ?? null,
              twitter: player.twitter ?? null,
              twitch: player.twitch ?? null,
              country: player.country ?? null,
          }

const prOf = (
    rows: readonly { readonly pr: B.PlayerPr }[] | undefined,
): EsportsPr | null => {
    const pr = rows?.[0]?.pr

    return pr === undefined
        ? null
        : {
              top8: pr.top8,
              top32: pr.top32,
              gold: pr.gold,
              silver: pr.silver,
              bronze: pr.bronze,
              powerRanking: pr.powerRanking,
              region: pr.region,
          }
}

const teammateOf = (teammate: {
    readonly player: B.Player
    readonly games: number
    readonly lastTeamedDate: number
}): EsportsTeammate => {
    const brawlhallaId = teammate.player.brawlhallaId ?? null
    const name = teammate.player.name ?? "Unknown"

    return {
        brawlhallaId,
        name,
        slug:
            brawlhallaId === null || brawlhallaId <= 0
                ? null
                : getEntitySlug(brawlhallaId, name),
        games: teammate.games,
        lastTeamedDate: teammate.lastTeamedDate,
    }
}

const placementOf = (placement: {
    readonly placement: number
    readonly tournament: B.Tournament
}): EsportsPlacement => ({
    placement: placement.placement,
    tournamentId: placement.tournament.id,
    tournamentName: placement.tournament.tournamentName,
    eventName: placement.tournament.eventName ?? null,
    year: placement.tournament.year,
    isOfficial: placement.tournament.isOfficial,
    isTwos: placement.tournament.isTwos,
    isOnline: placement.tournament.isOnline,
    startTime: placement.tournament.startTime,
    host: placement.tournament.host ?? null,
})

export type PlayerEsportsShape = {
    readonly get: (
        brawlhallaId: number,
    ) => Effect.Effect<Cached<PlayerEsportsData>>
}

export class PlayerEsports extends Context.Service<
    PlayerEsports,
    PlayerEsportsShape
>()("app/PlayerEsports") {}

export const layer = Layer.effect(
    PlayerEsports,
    Effect.gen(function* () {
        const brawltools = yield* Brawltools
        const cache = yield* Cache

        return {
            get: (brawlhallaId) =>
                cache.getOrSetCached(
                    // `v2`: see `PowerRankings` — shape changes must bump the key.
                    `esports:player:v2:${brawlhallaId}`,
                    esportsTtl,
                    Effect.gen(function* () {
                        const found =
                            yield* brawltools.getPlayerByBrawlhallaId(
                                brawlhallaId,
                            )

                        if (found === null || found.player.playerId === null) {
                            return empty
                        }

                        const esportsId = found.player.playerId

                        const [
                            oneVone,
                            twoVtwo,
                            recentLegend,
                            teammates,
                            placements1v1,
                            placements2v2,
                        ] = yield* Effect.all(
                            [
                                brawltools.listPrPlayers({
                                    gameMode: 1,
                                    bhIds: [brawlhallaId],
                                }),
                                brawltools.listPrPlayers({
                                    gameMode: 2,
                                    bhIds: [brawlhallaId],
                                }),
                                brawltools.getPlayerRecentLegend(esportsId),
                                brawltools.getPlayerTeammates({
                                    playerId: esportsId,
                                    maxResults: TEAMMATE_LIMIT,
                                }),
                                brawltools.getPlayerPlacements({
                                    playerIds: [esportsId],
                                    gameMode: 1,
                                    maxResults: PLACEMENT_LIMIT,
                                }),
                                brawltools.getPlayerPlacements({
                                    playerIds: [esportsId],
                                    gameMode: 2,
                                    maxResults: PLACEMENT_LIMIT,
                                }),
                            ],
                            { concurrency: 6 },
                        )

                        return {
                            identity: identityOf(found.player),
                            pr: {
                                "1v1": prOf(oneVone.players),
                                "2v2": prOf(twoVtwo.players),
                            },
                            recentLegend: recentLegend?.legend ?? null,
                            teammates:
                                teammates.playerTeammates.map(teammateOf),
                            placements: {
                                "1v1": placements1v1.playerPlacements.map(
                                    placementOf,
                                ),
                                "2v2": placements2v2.playerPlacements.map(
                                    placementOf,
                                ),
                            },
                        }
                    }).pipe(Effect.orDie),
                ),
        }
    }),
)
