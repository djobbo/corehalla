import { clanMock } from "./mocks/clan"
import { playerRankedMock } from "./mocks/playerRanked"
import { playerStatsMock } from "./mocks/playerStats"
import { rankings1v1Mock } from "./mocks/rankings1v1"
import { rankings2v2Mock } from "./mocks/rankings2v2"
import type { BrawlhallaID, RankedRegion } from "./constants"
import type {
    Clan,
    PlayerRanked,
    PlayerStats,
    Ranking1v1,
    Ranking2v2,
} from "./types"

const __DEV = process.env.NODE_ENV === "development"
const __ERROR_TEST_ALL = process.env.ERROR_TEST === "all"

const BH_API_BASE = "https://api.brawlhalla.com"

// TODO: Validate responses with zod

const getBhApi = async <T>(
    path: string,
    params: Record<string, string | undefined> = {},
) => {
    const url = new URL(path, BH_API_BASE)
    url.searchParams.append("api_key", process.env.BRAWLHALLA_API_KEY || "")
    Object.entries(params).forEach(([key, value]) => {
        if (value) url.searchParams.append(key, value)
    })
    const response = await fetch(url)
    return response.json() as Promise<T>
}

export const getIdBySteamId = (steamId: string) =>
    getBhApi<{
        brawlhalla_id: number
        name: string
    }>("/search", { steamid: steamId })

export const get1v1Rankings = async (
    region: RankedRegion,
    page: number,
    name = "",
) => {
    if (!__DEV) {
        return getBhApi<Ranking1v1[]>(`/rankings/1v1/${region}/${page}`, {
            name,
        })
    }

    if (__ERROR_TEST_ALL || process.env.ERROR_TEST === "ranked1v1") {
        throw new Error("TEST: Failed to fetch 1v1 rankings")
    }

    return rankings1v1Mock.filter((r) =>
        r.name.toLowerCase().startsWith(name?.toLowerCase() || ""),
    )
}

export const getRotatingRankings = async (
    region: RankedRegion,
    page: number,
    name = "",
) => {
    if (!__DEV) {
        return getBhApi<Ranking1v1[]>(`/rankings/rotating/${region}/${page}`, {
            name,
        })
    }

    if (__ERROR_TEST_ALL || process.env.ERROR_TEST === "rankedrotating") {
        throw new Error("TEST: Failed to fetch rotating rankings")
    }

    return rankings1v1Mock.filter((r) =>
        r.name.toLowerCase().startsWith(name?.toLowerCase() || ""),
    )
}

export const get2v2Rankings = async (region: RankedRegion, page: number) => {
    if (!__DEV) {
        return getBhApi<Ranking2v2[]>(`/rankings/2v2/${region}/${page}`)
    }

    if (__ERROR_TEST_ALL || process.env.ERROR_TEST === "ranked2v2") {
        throw new Error("TEST: Failed to fetch 2v2 rankings")
    }

    return rankings2v2Mock
}

export const getPlayerStats = async (playerId: BrawlhallaID) => {
    if (!__DEV) {
        return getBhApi<PlayerStats>(`/player/${playerId}/stats`)
    }

    if (__ERROR_TEST_ALL || process.env.ERROR_TEST === "playerstats") {
        throw new Error("TEST: Failed to fetch player stats")
    }

    return playerStatsMock
}

export const getPlayerRanked = async (playerId: BrawlhallaID) => {
    if (!__DEV) {
        return getBhApi<PlayerRanked>(`/player/${playerId}/ranked`)
    }

    if (__ERROR_TEST_ALL || process.env.ERROR_TEST === "playerranked") {
        throw new Error("TEST: Failed to fetch player ranked")
    }

    return playerRankedMock
}

export const getClan = async (clanId: BrawlhallaID) => {
    if (!__DEV) {
        return getBhApi<Clan>(`/clan/${clanId}`)
    }

    if (__ERROR_TEST_ALL || process.env.ERROR_TEST === "clanstats") {
        throw new Error("TEST: Failed to fetch clan")
    }

    return clanMock
}

export const getAllLegends = async () => getBhApi("/legend/all")

export const getLegend = async (legendId: number) =>
    getBhApi(`/legend/${legendId}`)
