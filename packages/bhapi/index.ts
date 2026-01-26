import { clanMock } from "./mocks/clan"
import { playerRankedMock } from "./mocks/playerRanked"
import { playerStatsMock } from "./mocks/playerStats"
import { rankings1v1Mock } from "./mocks/rankings1v1"
import { rankings2v2Mock } from "./mocks/rankings2v2"
import axios from "axios"
import type {
    Bracket,
    Clan,
    PlayerRanked,
    PlayerStats,
    Ranking1v1,
    Ranking2v2,
} from "./types"
import type { RankedRegion } from "./constants"

const __DEV = process.env.NODE_ENV === "development"

const BH_API_BASE = "https://api.brawlhalla.com"
const DAIR_GG_API_BASE = "https://api.dair.gg/proxy/brawlhalla-api"

const getBhApi = async <T>(
    path: string,
    params: Record<string, string | undefined> = {},
) => {
    return (
        await axios.get<T>(`${DAIR_GG_API_BASE}${path}`, {
            params: { ...params, api_key: process.env.BRAWLHALLA_API_KEY },
        }).catch(() => axios.get<T>(`${BH_API_BASE}${path}`, {
            params: { ...params, api_key: process.env.BRAWLHALLA_API_KEY },
        }))
    ).data
}

export const getIdBySteamId = (steamId: string) =>
    getBhApi<{
        brawlhalla_id: number
        name: string
    }>("/search", { steamid: steamId })

export const getRankings = async <
    BracketType extends Bracket,
    RankingType extends BracketType extends "1v1" ? Ranking1v1 : Ranking2v2,
>(
    bracket: BracketType,
    region: RankedRegion,
    page: string | number,
    name?: string,
) => {
    if (!__DEV)
        return getBhApi<RankingType[]>(
            `/rankings/${bracket}/${region}/${page}`,
            {
                name,
            },
        )

    switch (bracket) {
        case "1v1":
            return rankings1v1Mock.filter((r) =>
                r.name.toLowerCase().startsWith(name?.toLowerCase() || ""),
            ) as RankingType[]
        case "2v2":
            return rankings2v2Mock as RankingType[]
        default:
            return []
    }
}

export const getPlayerStats = async (playerId: number) =>
    __DEV ? playerStatsMock : getBhApi<PlayerStats>(`/player/${playerId}/stats`)

export const getPlayerRanked = async (playerId: number) =>
    __DEV
        ? playerRankedMock
        : getBhApi<PlayerRanked>(`/player/${playerId}/ranked`)

export const getClan = async (clanId: number) =>
    __DEV ? clanMock : getBhApi<Clan>(`/clan/${clanId}`)

export const getAllLegends = async () => getBhApi("/legend/all")

export const getLegend = async (legendId: number) =>
    getBhApi(`/legend/${legendId}`)
