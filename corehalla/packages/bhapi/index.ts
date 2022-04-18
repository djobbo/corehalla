import { IS_DEV } from "common/helpers/nodeEnv"
import { clanMock } from "./mocks/clan"
import { playerRankedMock } from "./mocks/playerRanked"
import { playerStatsMock } from "./mocks/playerStats"
import { rankings1v1Mock } from "./mocks/rankings1v1"
import { rankings2v2Mock } from "./mocks/rankings2v2"
import axios from "axios"
import type {
    Clan,
    PlayerRanked,
    PlayerStats,
    Ranking1v1,
    Ranking2v2,
} from "./types"

const BH_API_BASE = "https://api.brawlhalla.com"

const getBhApi = async <T>(
    path: string,
    params: Record<string, string | undefined> = {},
) => {
    return (
        await axios.get<T>(`${BH_API_BASE}${path}`, {
            params: { ...params, api_key: process.env.BH_API_KEY },
        })
    ).data
}

export const getIdBySteamId = (steamId: string) =>
    getBhApi<{
        brawlhalla_id: number
        name: string
    }>("/search", { steamid: steamId })

export type Bracket = "1v1" | "2v2"
export type Region =
    | "us-e"
    | "eu"
    | "sea"
    | "brz"
    | "aus"
    | "us-w"
    | "jpn"
    | "all"

export const getRankings = async (
    bracket: Bracket = "1v1",
    region: Region = "all",
    page = "1",
    name?: string,
) => {
    if (!IS_DEV)
        return getBhApi<Ranking1v1[] | Ranking2v2[]>(
            `/rankings/${bracket}/${region}/${page}`,
            { name },
        )

    switch (bracket) {
        case "1v1":
            return rankings1v1Mock
        case "2v2":
            return rankings2v2Mock
        default:
            return []
    }
}

export const getPlayerStats = async (playerId: string) =>
    IS_DEV
        ? playerStatsMock
        : getBhApi<PlayerStats>(`/player/${playerId}/stats`)

export const getPlayerRanked = async (playerId: string) =>
    IS_DEV
        ? playerRankedMock
        : getBhApi<PlayerRanked>(`/player/${playerId}/ranked`)

export const getClan = async (clanId: string) =>
    IS_DEV ? clanMock : getBhApi<Clan>(`/clan/${clanId}`)

export const getAllLegends = async () => getBhApi("/legend/all")

export const getLegend = async (legendId: number) =>
    getBhApi(`/legend/${legendId}`)