import { Effect } from "effect"
import { getEntitySlug } from "@crh/common/helpers/entitySlug"
import type { BrawltoolsShape } from "./brawltools"
import type { BrawltoolsError } from "./brawltools"
import type * as S from "./brawltools/schemas"
import type {
    PowerRankingsGameMode,
    PowerRankingsOrderBy,
    PowerRankingsPlayer,
    PowerRankingsRegion,
} from "@crh/api-contract/schemas"

/** brawltools caps at 100; 50 is its own default and our page size. */
export const MAX_RESULTS = 50

const gameModeValue = {
    "1v1": 1,
    "2v2": 2,
} as const satisfies Record<PowerRankingsGameMode, 1 | 2>

/** Rank and name ascend; every count/currency metric descends. */
const orderFor = (orderBy: PowerRankingsOrderBy): "ASC" | "DESC" =>
    orderBy === "powerRanking" || orderBy === "playerName" ? "ASC" : "DESC"

/**
 * `listPr` keys rows by brawltools' esports ID; `listPlayers` resolves that
 * batch to the identity fields our contract exposes.
 */
const toPlayer = (
    player: S.ListPrPlayer,
    identity: S.Player | undefined,
): PowerRankingsPlayer => {
    const brawlhallaId = identity?.brawlhallaId ?? null

    return {
        esportsId: player.playerId,
        playerName: player.playerName,
        fullName: identity?.name ?? null,
        pronoun: identity?.pronoun ?? null,
        brawlhallaId,
        sggPlayerId: identity?.sggPlayerId ?? null,
        cmPlayerId: identity?.cmPlayerId ?? null,
        twitter: identity?.twitter ?? player.twitter ?? null,
        twitch: identity?.twitch ?? player.twitch ?? null,
        country: identity?.country ?? null,
        slug:
            brawlhallaId === null || brawlhallaId <= 0
                ? null
                : getEntitySlug(brawlhallaId, player.playerName),
        top8: player.top8,
        top32: player.top32,
        gold: player.gold,
        silver: player.silver,
        bronze: player.bronze,
        powerRanking: player.powerRanking,
        points: player.points,
        earnings: player.earnings,
    }
}

export type PowerRankingsPage = {
    readonly players: readonly PowerRankingsPlayer[]
    readonly totalPages: number
}

export type PowerRankingsInput = {
    readonly gameMode: PowerRankingsGameMode
    readonly region: PowerRankingsRegion
    readonly page: number
    readonly orderBy: PowerRankingsOrderBy
}

/** Shared brawltools read for the power-rankings board. */
export const buildPowerRankings = (
    brawltools: BrawltoolsShape,
    input: PowerRankingsInput,
): Effect.Effect<PowerRankingsPage, BrawltoolsError> =>
    Effect.gen(function* () {
        const page = yield* brawltools.listPr({
            gameMode: gameModeValue[input.gameMode],
            region: input.region,
            page: input.page,
            maxResults: MAX_RESULTS,
            orderBy: `${input.orderBy} ${orderFor(input.orderBy)}`,
        })

        const empty: S.ListPlayersResponse = { players: [] }

        // A resolution failure must not blank the board — no links.
        const identities =
            page.prPlayers.length === 0
                ? empty
                : yield* brawltools
                      .listPlayers({
                          playerIds: page.prPlayers.map(
                              (player) => player.playerId,
                          ),
                      })
                      .pipe(
                          Effect.catchTag("BrawltoolsError", (error) =>
                              Effect.logWarning(
                                  "brawltools player resolution failed",
                                  error,
                              ).pipe(Effect.as(empty)),
                          ),
                      )

        const byId = new Map(
            identities.players.flatMap((player) =>
                player.playerId === null
                    ? []
                    : [[player.playerId, player] as const],
            ),
        )

        return {
            players: page.prPlayers.map((player) =>
                toPlayer(player, byId.get(player.playerId)),
            ),
            totalPages: page.totalPages,
        }
    })
