import { Context, Effect, Layer } from "effect"
import { HttpClient } from "effect/unstable/http"
import { envValue } from "@/env"
import { rankings1v1Mock } from "bhapi/mocks/rankings1v1"
import { rankings2v2Mock } from "bhapi/mocks/rankings2v2"
import { playerStatsMock } from "bhapi/mocks/playerStats"
import { playerRankedMock } from "bhapi/mocks/playerRanked"
import { clanMock } from "bhapi/mocks/clan"
import { retryTransient } from "./retry"
import type {
    Bracket,
    Clan,
    PlayerRanked,
    PlayerStats,
    Ranking1v1,
    Ranking2v2,
} from "bhapi/types"
import type { RankedRegion } from "bhapi/constants"

const BH_API_BASE = "https://api.brawlhalla.com"
const DAIR_GG_API_BASE = "https://api.dair.gg/proxy/brawlhalla-api"

const __DEV = import.meta.env.DEV

/**
 * Server-side Brawlhalla API access, implemented with Effect's `HttpClient`.
 *
 * Replaces the axios-based `bhapi` calls used by the tRPC procedures. Every
 * request goes through the shared transient-retry policy (exponential
 * backoff), and the dair.gg proxy falls back to the official API.
 *
 * `null` results mean "the upstream API does not know this resource" (used by
 * the routes to return a real 404). Development falls back to the same fixtures
 * `bhapi` used.
 */
export class Brawlhalla extends Context.Service<
    Brawlhalla,
    {
        readonly getRankings: (
            bracket: Bracket,
            region: RankedRegion,
            page: number,
            name?: string,
        ) => Effect.Effect<readonly (Ranking1v1 | Ranking2v2)[]>
        readonly getPlayerStats: (
            playerId: number,
        ) => Effect.Effect<PlayerStats | null>
        readonly getPlayerRanked: (
            playerId: number,
        ) => Effect.Effect<PlayerRanked | null>
        readonly getClan: (clanId: number) => Effect.Effect<Clan | null>
    }
>()("app/Brawlhalla") {}

export const layer = Layer.effect(
    Brawlhalla,
    Effect.gen(function* () {
        // Capture the client so the effects returned by this service have no
        // remaining requirements.
        const client = yield* HttpClient.HttpClient

        const getJson = <A>(
            path: string,
            params: Record<string, string | number> = {},
        ) =>
            Effect.gen(function* () {
                const query = {
                    ...params,
                    api_key: yield* Effect.promise(() =>
                        envValue("BRAWLHALLA_API_KEY"),
                    ),
                }

                const request = (base: string) =>
                    client
                        .get(`${base}${path}`, {
                            urlParams: query,
                            acceptJson: true,
                        })
                        .pipe(retryTransient)

                // The dair.gg proxy is preferred; fall back to the official API.
                const response = yield* request(DAIR_GG_API_BASE).pipe(
                    Effect.catch(() => request(BH_API_BASE)),
                )

                const body = yield* response.json

                return body as unknown as A
            })

        const getOptionalJson = <A>(path: string) =>
            getJson<A>(path).pipe(Effect.catch(() => Effect.succeed(null)))

        return {
            getRankings: (bracket, region, page, name) =>
                __DEV
                    ? Effect.sync(() => {
                          if (bracket === "1v1") {
                              return rankings1v1Mock.filter((r) =>
                                  r.name
                                      .toLowerCase()
                                      .startsWith(name?.toLowerCase() || ""),
                              )
                          }
                          if (bracket === "2v2") {
                              return rankings2v2Mock
                          }
                          return []
                      })
                    : getJson<readonly (Ranking1v1 | Ranking2v2)[]>(
                          `/rankings/${bracket}/${region}/${page}`,
                          name ? { name } : {},
                      ).pipe(Effect.orDie),

            getPlayerStats: (playerId) =>
                __DEV
                    ? Effect.succeed(playerStatsMock as PlayerStats | null)
                    : getOptionalJson<PlayerStats>(`/player/${playerId}/stats`),

            getPlayerRanked: (playerId) =>
                __DEV
                    ? Effect.succeed(playerRankedMock as PlayerRanked | null)
                    : getOptionalJson<PlayerRanked>(
                          `/player/${playerId}/ranked`,
                      ),

            getClan: (clanId) =>
                __DEV
                    ? Effect.succeed(clanMock as Clan | null)
                    : getOptionalJson<Clan>(`/clan/${clanId}`),
        }
    }),
)
