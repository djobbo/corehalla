const fetchLeaderboard = require('../leaderboard/fetchLeaderboard');

module.exports = (
	api_key,
	name,
	options = { perfect_match: false, unique: false, region: 'all' }
) => {
	return new Promise((resolve, reject) => {
		fetchLeaderboard(api_key, { bracket: '1v1', region, name })
			.then(lead => {
				if (options.perfect_match)
					lead = lead.filter(x => x.name === name);
				resolve(options.unique ? lead[0] || null : lead);
			})
			.catch(console.error);
	});
};
