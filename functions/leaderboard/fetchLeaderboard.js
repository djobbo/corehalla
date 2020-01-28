const axios = require('axios');

const baseURI = 'https://api.brawlhalla.com/rankings';

const defaultLeaderboardOptions = {
	bracket: '1v1',
	region: 'all',
	page: '1',
	name: ''
};

const fetchLeaderboard = (api_key, options) => {
	const params = { ...defaultLeaderboardOptions, ...options };
	return axios.get(
		`${baseURI}/${params.bracket}/${params.region}/${params.page}`,
		{ params: { api_key, name: options.name || '' } }
	);
};

exports = { fetchLeaderboard };
