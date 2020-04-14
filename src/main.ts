import axios from 'axios';
import { formatPlayerStats } from './formatters/playerStats';
import { formatClan } from './formatters/clan';

import {
    IClan,
    IRanking1v1,
    IRanking2v2,
    IPlayerStats,
    IPlayerRanked,
    RankedRegion,
} from './types';

const API_URL = 'https://api.brawlhalla.com';

export interface IRankingsOptions {
    region: RankedRegion;
    page: string | number;
    name: string;
}

const fetchPlayerById = <T>(apiKey: string, dataType: 'ranked' | 'stats') => (
    brawlhallaId: number
) =>
    axios
        .get<T>(
            `${API_URL}/player/${brawlhallaId}/${dataType}?api_key=${apiKey}`
        )
        .then(({ data }) => data);

const getBHIdBySteamId = (apiKey: string) => (steamId: string) =>
    axios
        .get<{ brawlhalla_id: number; name: string }>(
            `${API_URL}/search?steamid=${steamId}?api_key=${apiKey}`
        )
        .then(({ data }) => data);

const fetchClanById = (apiKey: string) => (clanId: number) =>
    axios
        .get<IClan>(`${API_URL}/clan/${clanId}?api_key=${apiKey}`)
        .then(({ data }) => data);

const fetchRankings = <T>(apiKey: string, bracket: '1v1' | '2v2') => ({
    region,
    page,
    name,
}: IRankingsOptions) =>
    axios
        .get<T[]>(
            `${API_URL}/rankings/${bracket}/${region}/${page}?name=${name}?api_key=${apiKey}`
        )
        .then(({ data }) => data);

const fetch1v1Rankings = (apiKey: string) =>
    fetchRankings<IRanking1v1>(apiKey, '1v1');

const fetch2v2Rankings = (apiKey: string) =>
    fetchRankings<IRanking2v2>(apiKey, '2v2');

const setupApiKey = (apiKey: string) => {
    const fetchPlayerStats = fetchPlayerById<IPlayerStats>(apiKey, 'stats');
    const fetchPlayerRanked = fetchPlayerById<IPlayerRanked>(apiKey, 'ranked');
    const fetchClan = fetchClanById(apiKey);

    const fetchAllStats = (brawlhallaId: number) =>
        Promise.all([
            fetchPlayerStats(brawlhallaId),
            fetchPlayerRanked(brawlhallaId),
        ]);

    return {
        // Player Stats/Ranked
        fetchPlayerStats,
        fetchPlayerRanked,
        fetchAllStats,
        fetchPlayerFormat: (brawlhallaId: number) =>
            fetchAllStats(brawlhallaId).then((stats) =>
                formatPlayerStats(...stats)
            ),

        // Clan Stats
        fetchClan,
        fetchClanFormat: (clanId: number) => fetchClan(clanId).then(formatClan),

        // Rankings
        fetch1v1Rankings: fetch1v1Rankings(apiKey),
        fetch2v2Rankings: fetch2v2Rankings(apiKey),

        // Steam Search
        getBHIdBySteamId: getBHIdBySteamId(apiKey),
    };
};

export default setupApiKey;
export * from './types';
