const axios = require('axios');
const formatPlayerStats = require('./formatters/playerStats');

const api = 'https://api.brawlhalla.com';

const defaultLeaderboardOptions = {
    bracket: '1v1',
    region: 'all',
    page: '1',
    name: ''
};

const fetchPlayerById = (api_key, dataType) => async brawlhalla_id =>
    (await axios.get(`${api}/player/${brawlhalla_id}/${dataType}`, {
        params: { api_key }
    })).data;

const getBHIdBySteamId = (api_key) => async steamid =>
    (await axios.get(`${api}/search`, {
        params: { api_key, steamid }
    })).data;

const fetchClanById = api_key => async clan_id =>
    (await axios.get(`${api}/clan/${clan_id}`, {
        params: { api_key }
    })).data;

const fetchRankings = api_key => async options => {
    const { bracket, region, page, name } = { ...defaultLeaderboardOptions, ...options };
    return (await axios.get(`${api}/rankings/${bracket}/${region}/${page}`, {
        params: { api_key, name }
    })).data;
}

const fetchLegendById = api_key => (legend = 'all') =>
    axios.get(`${api}/legend/${legend}`, {
        params: { api_key }
    });

module.exports = api_key => {
    console.log(api_key);
    const fetchPlayerStats = fetchPlayerById(api_key, 'stats');
    const fetchPlayerRanked = fetchPlayerById(api_key, 'ranked');
    const fetchAllStats = brawlhalla_id => Promise.all([
        fetchPlayerStats(brawlhalla_id),
        fetchPlayerRanked(brawlhalla_id)
    ]);

    return {
        fetchPlayerStats,
        fetchPlayerRanked,
        fetchAllStats,
        fetchPlayerFormat: async brawlhalla_id =>
            formatPlayerStats(...(await fetchAllStats(brawlhalla_id))),
        fetchClan: fetchClanById(api_key),
        fetchRankings: fetchRankings(api_key),
        fetchLegend: fetchLegendById(api_key),
        getBHIdBySteamId: getBHIdBySteamId(api_key)
    }
};