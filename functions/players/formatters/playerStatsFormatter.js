const _ = require('lodash');
const legendsStatsFormatter = require('./legendsStatsFormatter');

module.exports = (id, playerStats, playerRanked) => {
	return new Promise((resolve, reject) => {
		legendsStatsFormatter(
			playerStats ? playerStats.legends : undefined,
			playerRanked ? playerRanked.legends : undefined
		).then(legendsStats => {
			const generalStats = _.mergeWith(
				{},
				...legendsStats,
				(obj, src) => {
					return _.isNumber(obj) ? obj + src : undefined;
				}
			);
			const weaponsStats = generalStats.overall.weapons;
			console.log(weaponsStats);
			let player = {
				id: playerStats.brawlhalla_id,
				name: playerStats.name || '',
				overall: {
					level: playerStats.level || 0,
					xp: playerStats.xp || 0,
					xp_percentage: playerStats.xp_percentage || 0,
					damage: {
						dealt: generalStats.overall.damage.dealt,
						taken: generalStats.overall.damage.taken
					},
					kos: {
						kills: generalStats.overall.kos.kills,
						falls: generalStats.overall.kos.falls,
						suicides: generalStats.overall.kos.suicides,
						team_kills: generalStats.overall.kos.team_kills
					},
					games: {
						total_games: playerStats.games || 0,
						wins: playerStats.wins || 0,
						losses: playerStats.games - playerStats.wins || 0
					}
				},
				season: playerRanked
					? {
							rating: playerRanked.rating || 'N/A',
							peak_rating: playerRanked.peak_rating || 'N/A',
							tier: playerRanked.tier || 'Unranked',
							games: {
								total_games: playerStats.games || 0,
								wins: playerStats.wins || 0,
								losses:
									playerStats.games - playerStats.wins || 0
							}
					  }
					: {
							rating: 'N/A',
							peak_rating: 'N/A',
							tier: 'Unranked',
							games: {
								total_games: 0,
								wins: 0,
								losses: 0
							}
					  },
				legends: legendsStats,
				weapons: Object.values(weaponsStats).filter(
					w =>
						!['Unarmed', 'Gadgets', 'Weapon Throws'].includes(
							w.name
						)
				),
				unarmed: weaponsStats.unarmed,
				gadgets: weaponsStats.gadgets,
				weapon_throws: weaponsStats.weapon_throws
			};
			resolve(player);
		});
	});
};
