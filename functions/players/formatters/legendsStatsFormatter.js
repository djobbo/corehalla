const fs = require('fs');
const convertXML = require('xml-js');

const staticLegendsDataXML = fs.readFileSync('data/HeroTypes.xml');
const staticLegendsData = convertXML.xml2js(staticLegendsDataXML, {
	compact: true
}).HeroTypes.HeroType;

module.exports = (legendsStats, legendsRanked) => {
	return new Promise((resolve, reject) => {
		let legends = [];
		let weapons = [];
		staticLegendsData.forEach(hero => {
			const legendStats = legendsStats
				? legendsStats.find(
						l => l.legend_id.toString() === hero.HeroID._text
				  ) || {}
				: {};
			const legendRanked = legendsRanked
				? legendsRanked.find(
						l => l.legend_id.toString() === hero.HeroID._text
				  ) || {}
				: {};
			let weapon_one = getWeaponStats(
				hero.BaseWeapon1._text,
				legendStats.damageweaponone || 0,
				legendStats.koweaponone || 0,
				legendStats.timeheldweaponone || 0
			);
			let weapon_two = getWeaponStats(
				hero.BaseWeapon2._text,
				legendStats.damageweapontwo || 0,
				legendStats.koweapontwo || 0,
				legendStats.timeheldweapontwo || 0
			);
			let unarmed = getWeaponStats(
				'Unarmed',
				legendStats.damageunarmed || 0,
				legendStats.kounarmed || 0,
				legendStats.matchtime -
					(legendStats.timeheldweaponone +
						legendStats.timeheldweapontwo) || 0
			);
			let gadgets = getWeaponStats(
				'Gadgets',
				legendStats.damagegadgets || 0,
				legendStats.kogadgets || 0,
				undefined
			);
			let weapon_throws = getWeaponStats(
				'Weapon Throws',
				legendStats.damagethrownitem || 0,
				legendStats.kothrownitem || 0,
				undefined
			);
			let legend = {
				id: hero.HeroID._text,
				name: hero.HeroDisplayName._text,
				overall: {
					level: legendStats.level || 0,
					xp: legendStats.xp || 0,
					xp_percentage: legendStats.xp_percentage || 0,
					damage: {
						dealt: parseInt(legendStats.damagedealt || 0),
						taken: parseInt(legendStats.damagetaken || 0)
					},
					kos: {
						kills: legendStats.kos || 0,
						falls: legendStats.falls || 0,
						suicides: legendStats.suicides || 0,
						team_kills: legendStats.teamkos || 0
					},
					matchtime: legendStats.matchtime || 0,
					games: {
						matches: legendStats.games || 0,
						wins: legendStats.wins || 0,
						losses: legendStats.games - legendStats.wins || 0
					}
				},
				season: {
					rating: legendRanked.rating || 750,
					peak_rating: legendRanked.peak_rating || 750,
					tier: legendRanked.tier || 'Unranked',
					games: {
						matches: legendRanked.games || 0,
						wins: legendRanked.wins || 0,
						losses: legendRanked.games - legendRanked.wins || 0
					}
				}
			};
			const weaponLegendStats = getWeaponLegendStats(legend);
			weapons.push({
				[hero.BaseWeapon1._text]: {
					...weapon_one,
					...{ legend: weaponLegendStats }
				},
				[hero.BaseWeapon2._text]: {
					...weapon_two,
					...{ legend: weaponLegendStats }
				}
			});

			legend.weapons = {
				weapon_one: hero.BaseWeapon1._text,
				weapon_two: hero.BaseWeapon2._text,
				[hero.BaseWeapon1._text]: weapon_one,
				[hero.BaseWeapon2._text]: weapon_two,
				unarmed,
				gadgets,
				weapon_throws
			};

			legends.push(legend);
		});
		resolve({ legends, weapons });
	});
};

function getWeaponStats(name, damage_dealt, kills, time_held) {
	return {
		name,
		damage_dealt: parseInt(damage_dealt),
		kills,
		time_held
	};
}

function getWeaponLegendStats(legend) {
	return {
		id: [legend.id],
		legend_count: 1,
		name: [legend.name],
		overall: {
			level: [legend.overall.level],
			total_level: legend.overall.level,
			xp: [legend.overall.xp],
			total_xp: legend.overall.xp,
			damage: {
				dealt: [legend.overall.damage.dealt],
				total_dealt: legend.overall.damage.dealt
			},
			kos: {
				kills: [legend.overall.kos.kills],
				total_kills: legend.overall.kos.kills
			},
			matchtime: [legend.overall.matchtime],
			games: {
				matches: [legend.overall.games.matches],
				total_matches: legend.overall.games.matches,
				wins: [legend.overall.games.wins],
				total_wins: legend.overall.games.wins,
				losses: [legend.overall.games.losses],
				total_losses: legend.overall.games.losses
			}
		},
		season: {
			rating: [legend.season.rating],
			total_rating: legend.season.rating,
			peak_rating: [legend.season.peak_rating],
			total_peak_rating: legend.season.peak_rating,
			games: {
				matches: [legend.season.games.matches],
				total_matches: legend.season.games.matches,
				wins: [legend.season.games.wins],
				total_wins: legend.season.games.wins,
				losses: [legend.season.games.losses],
				total_losses: legend.season.games.losses
			}
		}
	};
}
