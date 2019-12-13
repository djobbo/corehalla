const legendsStatsFormatter = require('./legendsStatsFormatter');

module.exports = (id, playerStats, playerRanked) => {
	return new Promise((resolve, reject) => {
		legendsStatsFormatter(
			playerStats ? playerStats.legends : undefined,
			playerRanked ? playerRanked.legends : undefined
		).then(legendsStats => {
			let player = {
				id: playerStats.brawlhalla_id,
				name: playerStats.name,
				overall: {
					level: playerStats.level,
					xp: playerStats.xp,
					xp_percentage: playerStats.xp_percentage,
					...legendsStats
				}
			};
			resolve(player);
		});
	});
};
