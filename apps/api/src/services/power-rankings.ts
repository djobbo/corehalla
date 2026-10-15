import { Context, Effect, Layer, Schema } from "effect"
import { getEntitySlug } from "@crh/common/helpers/entitySlug"
import { Cache } from "@crh/core/services/cache"
import { Brawltools } from "./brawltools"
import type * as S from "./brawltools/schemas"
import { PowerRankingsPlayerSchema } from "@crh/api-contract/schemas"
import type { CacheWindow } from "@crh/core/services/cache-policy"
import type { Cached } from "@crh/core/services/cache"
import type {
    PowerRankingsGameMode,
    PowerRankingsOrderBy,
    PowerRankingsPlayer,
    PowerRankingsRegion,
} from "@crh/api-contract/schemas"

/** brawltools caps at 100; 50 is its own default and our page size. */
const MAX_RESULTS = 50

/** Republished rarely — six hours fresh, two days of serve-stale is plenty. */
const powerTtl: CacheWindow = {
    freshSeconds: 6 * 60 * 60,
    staleSeconds: 48 * 60 * 60,
}

const gameModeValue = {
    "1v1": 1,
    "2v2": 2,
} as const satisfies Record<PowerRankingsGameMode, 1 | 2>

/** Rank and name ascend; every count/currency metric descends. */
const orderFor = (orderBy: PowerRankingsOrderBy): "ASC" | "DESC" =>
    orderBy === "powerRanking" || orderBy === "playerName" ? "ASC" : "DESC"

/**
 * `listPr` keys rows by brawltools' esports ID; `listPlayers` resolves that
 * batch to the identity fields (Brawlhalla ID, start.gg ID, socials) our
 * contract exposes. Cached as one unit so the extra call rides the PR TTL.
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

/** Cached payload; the schema re-validates KV/L1 hits (see `CacheRead`). */
const PowerRankingsPageSchema = Schema.Struct({
    players: Schema.Array(PowerRankingsPlayerSchema),
    totalPages: Schema.Number,
})

export type PowerRankingsPage = typeof PowerRankingsPageSchema.Type

export type PowerRankingsShape = {
    readonly getPowerRankings: (input: {
        readonly gameMode: PowerRankingsGameMode
        readonly region: PowerRankingsRegion
        readonly page: number
        readonly orderBy: PowerRankingsOrderBy
    }) => Effect.Effect<Cached<PowerRankingsPage>>
}

export class PowerRankings extends Context.Service<
    PowerRankings,
    PowerRankingsShape
>()("app/PowerRankings") {}

export const layer = Layer.effect(
    PowerRankings,
    Effect.gen(function* () {
        const brawltools = yield* Brawltools
        const cache = yield* Cache

        return {
            getPowerRankings(input) {
                const program: Effect.Effect<PowerRankingsPage> = Effect.gen(
                    function* () {
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
                                          Effect.catchTag(
                                              "BrawltoolsError",
                                              (error) =>
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
                    },
                ).pipe(Effect.orDie)

                return cache.getOrSetCached(
                    `pr:${input.gameMode}:${input.region}:${input.page}:${input.orderBy}`,
                    { ...powerTtl, schema: PowerRankingsPageSchema },
                    program,
                )
            },
        }
    }),
)
