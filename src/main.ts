import axios from 'axios';
import { formatPlayerStats } from './formatters/playerStats';
import { formatClan } from './formatters/clan';

import {
    IRankingsOptions,
    IClan,
    IRanking,
    IPlayerStats,
    IPlayerRanked,
} from './types/types';

const API_URL = 'https://api.brawlhalla.com';

const defaultRankingsOptions: IRankingsOptions = {
    bracket: '1v1',
    region: 'all',
    page: '1',
    name: '',
};

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

const fetchRankings = (apiKey: string) => ({
    bracket = defaultRankingsOptions.bracket,
    region = defaultRankingsOptions.region,
    page = defaultRankingsOptions.page,
    name = defaultRankingsOptions.name,
}: IRankingsOptions) =>
    axios
        .get<IRanking[]>(
            `${API_URL}/rankings/${bracket}/${region}/${page}?name=${name}?api_key=${apiKey}`
        )
        .then(({ data }) => data);

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
        fetchPlayerStats,
        fetchPlayerRanked,
        fetchAllStats,
        fetchPlayerFormat: (brawlhallaId: number) =>
            fetchAllStats(brawlhallaId).then((stats) =>
                formatPlayerStats(...stats)
            ),
        fetchClan,
        fetchClanFormat: (clanId: number) => fetchClan(clanId).then(formatClan),
        fetchRankings: fetchRankings(apiKey),
        getBHIdBySteamId: getBHIdBySteamId(apiKey),
    };
};

export default setupApiKey;
export * from './types/types';
