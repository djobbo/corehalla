const axios = require('axios');
const formatPlayer = require('./formatters/playerStatsFormatter');
const {
	playerRoute,
	searchBySteamIdRoute,
	leaderboardRoute,
	clanRoute
} = require('./routes');

const defaultLeaderboardOptions = {
	bracket: '1v1',
	region: 'all',
	page: '1',
	name: ''
};

// Players
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

const findPlayerBySteamId = (api_key, steam_id) =>
	axios.get(`${searchBySteamIdRoute}/${steam_id}`, {
		params: { api_key, steam_id }
	});

const fetchPlayerFormat = async (api_key, brawlhalla_id) => {
	const stats = await fetchAllStats(api_key, brawlhalla_id);
	return formatPlayer(brawlhalla_id, stats[0], stats[1]);
};

// Leaderboard
const fetchLeaderboard = (api_key, options) => {
	const params = { ...defaultLeaderboardOptions, ...options };
	return axios.get(
		`${leaderboardRoute}/${params.bracket}/${params.region}/${params.page}`,
		{ params: { api_key, name: options.name || '' } }
	);
};

// Clans
const fetchClanStats = (api_key, clan_id) =>
	axios.get(`${clanRoute}/${clan_id}`, { params: { api_key } });

// Exports
module.exports = {
	fetchPlayerStats,
	fetchPlayerRanked,
	fetchAllStats,
	findPlayerBySteamId,
	fetchPlayerFormat,
	fetchLeaderboard,
	fetchClanStats
};
