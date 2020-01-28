const axios = require('axios');

const { leaderboardRoute } = require('../routes');

const defaultLeaderboardOptions = {
	bracket: '1v1',
	region: 'all',
	page: '1',
	name: ''
};

const fetchLeaderboard = (api_key, options) => {
	const params = { ...defaultLeaderboardOptions, ...options };
	return axios.get(
		`${leaderboardRoute}/${params.bracket}/${params.region}/${params.page}`,
		{ params: { api_key, name: options.name || '' } }
	);
};

exports = { fetchLeaderboard };
