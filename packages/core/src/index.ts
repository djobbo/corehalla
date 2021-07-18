import axios from 'axios'

import { format1v1Rankings, format2v2Rankings, formatClan, formatPlayerStats } from './format'
import type {
    BrawlhallaID,
    IClan,
    IClanFormat,
    IPlayerRanked,
    IPlayerStats,
    IPlayerStatsFormat,
    IRanking1v1,
    IRanking1v1Format,
    IRanking2v2,
    IRanking2v2Format,
    RankedRegion,
} from './types'

const API_URL = 'https://api.brawlhalla.com'

interface IRankingsOptions {
    region: RankedRegion
    page: string | number
    name: string
}

const fetchPlayerById = <T>(apiKey: string, dataType: 'ranked' | 'stats', brawlhallaId: BrawlhallaID) =>
    axios.get<T>(`${API_URL}/player/${brawlhallaId}/${dataType}?api_key=${apiKey}`).then(async (res) => res.data)

// const getBHIdBySteamId = (apiKey: string, steamId: string) =>
// 	axios
// 		.get<{ brawlhalla_id: number; name: string }>(
// 			`${API_URL}/search?steamid=${steamId}&api_key=${apiKey}`
// 		)
// 		.then(async (res) => res.data);

const fetchClanById = (apiKey: string, clanId: BrawlhallaID) =>
    axios.get<IClan>(`${API_URL}/clan/${clanId}?api_key=${apiKey}`).then(async (res) => res.data)

const fetchRankings = <T>(apiKey: string, bracket: '1v1' | '2v2', { region, page, name }: IRankingsOptions) =>
    axios
        .get<T[]>(`${API_URL}/rankings/${bracket}/${region.toLowerCase()}/${page}?name=${name}&api_key=${apiKey}`)
        .then(async (res) => res.data)

// const fetchPowerRankings = (bracket: '1v1' | '2v2') =>
//     axios
//         .get<string>(
//             `https://www.brawlhalla.com/rankings/power/${bracket || ''}`,
//         )
//         .then(async (res) => formatPowerRankings(res.data));

const fetchAllStats = async (
    apiKey: string,
    brawlhallaId: BrawlhallaID,
): Promise<[IPlayerStats | undefined, IPlayerRanked | undefined]> => {
    const [stats, ranked] = await Promise.allSettled([
        fetchPlayerById<IPlayerStats>(apiKey, 'stats', brawlhallaId),
        fetchPlayerById<IPlayerRanked>(apiKey, 'ranked', brawlhallaId),
    ])
    return [
        stats.status === 'rejected' ? undefined : stats.value,
        ranked.status === 'rejected' ? undefined : ranked.value,
    ]
}

export const fetchPlayerFormat = (apiKey: string, brawlhallaId: BrawlhallaID): Promise<IPlayerStatsFormat | null> =>
    fetchAllStats(apiKey, brawlhallaId).then((stats) =>
        stats.some((x) => !x || typeof x.brawlhalla_id === undefined) //TODO: Better {} check
            ? null
            : formatPlayerStats(...stats),
    )

export const fetchClanFormat = (apiKey: string, clanId: BrawlhallaID): Promise<IClanFormat | null> =>
    fetchClanById(apiKey, clanId).then(formatClan)

export const fetch1v1RankingsFormat = (apiKey: string, options: IRankingsOptions): Promise<IRanking1v1Format[]> =>
    fetchRankings<IRanking1v1>(apiKey, '1v1', options).then(format1v1Rankings)

export const fetch2v2RankingsFormat = (apiKey: string, options: IRankingsOptions): Promise<IRanking2v2Format[]> =>
    fetchRankings<IRanking2v2>(apiKey, '2v2', options).then(format2v2Rankings)
