import { Effect } from "effect"
import { HttpClient } from "effect/unstable/http"
import { envValue } from "../../env"
import { clanMock } from "@crh/bhapi/mocks/clan"
import { playerRankedMock } from "@crh/bhapi/mocks/playerRanked"
import { playerStatsMock } from "@crh/bhapi/mocks/playerStats"
import { rankings1v1Mock } from "@crh/bhapi/mocks/rankings1v1"
import { rankings2v2Mock } from "@crh/bhapi/mocks/rankings2v2"
import { retryTransient } from "../retry"
import { withUserAgent } from "./user-agent"
import type {
    Bracket,
    Clan,
    PlayerRanked,
    PlayerStats,
    Ranking1v1,
    Ranking2v2,
} from "@crh/bhapi/types"
import type { RankedRegion } from "@crh/bhapi/constants"

const BH_API_BASE = "https://api.brawlhalla.com"
const DAIR_GG_API_BASE = "https://api.dair.gg/proxy/brawlhalla-api"

/** rolldown has no `import.meta.env.DEV` — use NODE_ENV. */
const __DEV = globalThis.process?.env?.["NODE_ENV"] === "development"

/** Legacy v0 API; dair.gg first, official API fallback. `null` → handlers 404. */
export const legacyOps = (client: HttpClient.HttpClient) => {
    // filterStatusOk: error envelope must not be cast as success and fail as decode.
    const http = withUserAgent(HttpClient.filterStatusOk(client))

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
                http
                    .get(`${base}${path}`, {
                        urlParams: query,
                        acceptJson: true,
                    })
                    .pipe(retryTransient)

            const response = yield* request(DAIR_GG_API_BASE).pipe(
                Effect.catch(() => request(BH_API_BASE)),
            )

            const body = yield* response.json

            return body as unknown as A
        })

    const getOptionalJson = <A>(path: string) =>
        getJson<A>(path).pipe(Effect.catch(() => Effect.succeed(null)))

    return {
        getRankings: (
            bracket: Bracket,
            region: RankedRegion,
            page: number,
            name?: string,
        ): Effect.Effect<readonly (Ranking1v1 | Ranking2v2)[]> =>
            __DEV
                ? Effect.sync(() => {
                      if (page > 1) return []

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

        getPlayerStats: (
            playerId: number,
        ): Effect.Effect<PlayerStats | null> =>
            __DEV
                ? Effect.succeed(playerStatsMock as PlayerStats | null)
                : getOptionalJson<PlayerStats>(`/player/${playerId}/stats`),

        getPlayerRanked: (
            playerId: number,
        ): Effect.Effect<PlayerRanked | null> =>
            __DEV
                ? Effect.succeed(playerRankedMock as PlayerRanked | null)
                : getOptionalJson<PlayerRanked>(`/player/${playerId}/ranked`),

        getClan: (clanId: number): Effect.Effect<Clan | null> =>
            __DEV
                ? Effect.succeed(clanMock as Clan | null)
                : getOptionalJson<Clan>(`/clan/${clanId}`),
    }
}

export type LegacyOps = ReturnType<typeof legacyOps>
