import fetch from 'cross-fetch';

import {
    formatPlayerStats,
    formatClan,
    format1v1Rankings,
    format2v2Rankings,
    formatPowerRankings,
    getGloryFromBestRating,
    getGloryFromWins,
    getHeroRatingSquash,
    getPersonalRatingSquash,
    getTierFromRating,
} from './formatters';

import { IClan, IRanking1v1, IRanking2v2, IPlayerStats, IPlayerRanked, RankedRegion } from './types';

const API_URL = 'https://api.brawlhalla.com';

export interface IRankingsOptions {
    region: RankedRegion;
    page: string | number;
    name: string;
}

const fetchPlayerById = <T>(apiKey: string, dataType: 'ranked' | 'stats') => (brawlhallaId: number) =>
    fetch(`${API_URL}/player/${brawlhallaId}/${dataType}?api_key=${apiKey}`).then(
        async (res) => (await res.json()) as T,
    );

const getBHIdBySteamId = (apiKey: string) => (steamId: string) =>
    fetch(`${API_URL}/search?steamid=${steamId}&api_key=${apiKey}`).then(
        async (res) => (await res.json()) as { brawlhalla_id: number; name: string },
    );

const fetchClanById = (apiKey: string) => (clanId: number) =>
    fetch(`${API_URL}/clan/${clanId}?api_key=${apiKey}`).then(async (res) => (await res.json()) as IClan);

const fetchRankings = <T>(apiKey: string, bracket: '1v1' | '2v2') => ({ region, page, name }: IRankingsOptions) =>
    fetch(`${API_URL}/rankings/${bracket}/${region.toLowerCase()}/${page}?name=${name}&api_key=${apiKey}`).then(
        async (res) => (await res.json()) as T[],
    );

const fetchPowerRankings = (bracket: '1v1' | '2v2' | undefined = undefined) =>
    fetch(`https://www.brawlhalla.com/rankings/power/${bracket || ''}`).then(async (res) =>
        formatPowerRankings((await res.json()) as string),
    );

const createApiConnection = (apiKey: string) => {
    const fetchPlayerStats = fetchPlayerById<IPlayerStats>(apiKey, 'stats');
    const fetchPlayerRanked = fetchPlayerById<IPlayerRanked>(apiKey, 'ranked');
    const fetchClan = fetchClanById(apiKey);

    const fetch1v1Rankings = fetchRankings<IRanking1v1>(apiKey, '1v1');
    const fetch2v2Rankings = fetchRankings<IRanking2v2>(apiKey, '2v2');

    const fetchAllStats = (brawlhallaId: number) =>
        Promise.all([fetchPlayerStats(brawlhallaId), fetchPlayerRanked(brawlhallaId)]);

    return {
        // Player Stats/Ranked
        fetchPlayerStats,
        fetchPlayerRanked,
        fetchAllStats,
        fetchPlayerFormat: (brawlhallaId: number) =>
            fetchAllStats(brawlhallaId).then((stats) => formatPlayerStats(...stats)),

        // Clan Stats
        fetchClan,
        fetchClanFormat: (clanId: number) => fetchClan(clanId).then(formatClan),

        // Rankings
        fetch1v1Rankings,
        fetch2v2Rankings,
        fetch1v1RankingsFormat: (options: IRankingsOptions) => fetch1v1Rankings(options).then(format1v1Rankings),
        fetch2v2RankingsFormat: (options: IRankingsOptions) => fetch2v2Rankings(options).then(format2v2Rankings),

        // Power Rankings
        fetchPowerRankings,

        // Steam Search
        getBHIdBySteamId: getBHIdBySteamId(apiKey),
    };
};

export * from './types';
export {
    createApiConnection,
    getGloryFromBestRating,
    getGloryFromWins,
    getHeroRatingSquash,
    getPersonalRatingSquash,
    getTierFromRating,
};
