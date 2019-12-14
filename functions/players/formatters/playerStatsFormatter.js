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
				name: playerStats.name,
				overall: {
					level: playerStats.level,
					xp: playerStats.xp,
					xp_percentage: playerStats.xp_percentage,
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
						total_games: playerStats.games,
						wins: playerStats.wins,
						losses: playerStats.games - playerStats.losses
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
