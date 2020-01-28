const axios = require('axios');
const formatPlayer = require('./formatters/playerStatsFormatter');

const { playerRoute, searchBySteamIdRoute } = require('../routes');

// Base Format

const fetchPlayerById = (api_key, brawlhalla_id, dataType) =>
	axios.get(`${playerRoute}/${brawlhalla_id}/${dataType}`, {
		params: { api_key }
	});

const fetchPlayerStats = (api_key, brawlhalla_id) =>
	fetchPlayerById(api_key, brawlhalla_id, 'stats');

const fetchPlayerRanked = (api_key, brawlhalla_id) =>
	fetchPlayerById(api_key, brawlhalla_id, 'ranked');

const fetchAllStats = (api_key, brawlhalla_id) =>
	Promise.all([
		fetchPlayerStats(api_key, brawlhalla_id),
		fetchPlayerRanked(api_key, brawlhalla_id)
	]);

// Find Player

const findPlayerBySteamId = (api_key, steam_id) =>
	axios.get(searchBySteamIdRoute, { params: { api_key, steam_id } });

// Custom Format

const fetchPlayerFormat = async (api_key, brawlhalla_id) => {
	let data = await fetchAllStats(api_key, brawlhalla_id);
	return formatPlayer(brawlhalla_id, data[0], data[1]);
};

// Exports

exports = {
	fetchPlayerStats,
	fetchPlayerRanked,
	fetchAllStats,
	findPlayerBySteamId,
	fetchPlayerFormat
};
