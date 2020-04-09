import axios from 'axios';
const formatPlayerStats = require('./formatters/playerStats');
const formatClanStats = require('./formatters/clan');

const api = 'https://api.brawlhalla.com';

const defaultLeaderboardOptions: corehalla.IRankingsOptions = {
	bracket: '1v1',
	region: 'all',
	page: '1',
	name: '',
};

const fetchPlayerById = <T>(api_key: string, dataType: 'ranked' | 'stats') => (
	brawlhalla_id: string | number
) =>
	axios.get<T>(
		`${api}/player/${brawlhalla_id}/${dataType}?api_key=${api_key}`
	);

const getBHIdBySteamId = (api_key: string) => (steamid: string) =>
	axios.get<{ brawlhalla_id: string; name: string }>(
		`${api}/search?steamid=${steamid}&api_key=${api_key}`
	);

const fetchClanById = (api_key: string) => (clan_id: string | number) =>
	axios.get<corehalla.IClan>(`${api}/clan/${clan_id}?api_key=${api_key}`);

const fetchRankings = (api_key: string) => ({
	bracket,
	region,
	page,
	name,
}: corehalla.IRankingsOptions = defaultLeaderboardOptions) =>
	axios.get<corehalla.IRanking[]>(
		`${api}/rankings/${bracket}/${region}/${page}?name=${name}&api_key=${api_key}`
	);

export default (api_key: string) => {
	const fetchPlayerStats = fetchPlayerById<corehalla.IPlayerStats>(
		api_key,
		'stats'
	);
	const fetchPlayerRanked = fetchPlayerById<corehalla.IPlayerRanked>(
		api_key,
		'ranked'
	);
	const fetchAllStats = (brawlhalla_id: string | number) =>
		Promise.all([
			fetchPlayerStats(brawlhalla_id),
			fetchPlayerRanked(brawlhalla_id),
		]);

	return {
		fetchPlayerStats,
		fetchPlayerRanked,
		fetchAllStats,
		fetchPlayerFormat: async (brawlhalla_id: string | number) =>
			formatPlayerStats(...(await fetchAllStats(brawlhalla_id))),
		fetchClan: fetchClanById(api_key),
		fetchClanFormat: async (clan_id: string | number) =>
			formatClanStats(await fetchClanById(clan_id)),
		fetchRankings: fetchRankings(api_key),
		getBHIdBySteamId: getBHIdBySteamId(api_key),
	};
};
