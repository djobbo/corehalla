const cleanString = require('./util');

const {
	getGloryFromWins,
	getGloryFromBestRating,
	getHeroRatingSquash,
	getPersonalRatingSquash
} = require('./gloryCalculator');

const {
	staticLegendsData,
	regions,
	defaultLegendStats,
	defaultLegendSeason,
	defaultWeaponStats
} = require('../data/static-data');

function formatPlayerStats(playerStats, playerRanked) {
	const {
		legends: legendsStats,
		clan: clanStats,
		...generalStats
	} = playerStats || { legends: [], clan: {} };

	const {
		legends: legendsRanked,
		['2v2']: teamsStats,
		brawlhalla_id: _prid,
		name: _prname,
		global_rank: _prgr,
		region_rank: _prrr,
		...seasonStats
	} = playerRanked || { legends: [], '2v2': [] };

	const { legends, weapons } = formatLegendsAndWeaponsStats(
		staticLegendsData,
		legendsStats,
		legendsRanked
	);

	const season = getSeasonStats(seasonStats, teamsStats, legendsRanked);

	return {
		...generalStats,
		season,
		clan: clanStats,
		legends,
		weapons: formatWeaponStats(weapons),
		teams: formatTeamsStats(teamsStats)
	};
}

function formatLegendsAndWeaponsStats(
	staticLegendsData,
	legendsStats,
	legendsRanked
) {
	const { legends, weapons } = staticLegendsData.reduce(
		(acc, staticLegend) => {
			const legendFormat = formatLegendStats(
				staticLegend,
				legendsStats.find(l => l.legend_id === staticLegend.id),
				legendsRanked.find(l => l.legend_id === staticLegend.id)
			);

			acc.legends[staticLegend.name] = legendFormat;

			acc.weapons = addWeaponStats('one', acc.weapons, legendFormat);
			acc.weapons = addWeaponStats('two', acc.weapons, legendFormat);

			return acc;
		},
		{
			legends: {},
			weapons: {}
		}
	);
	return { legends: Object.values(legends), weapons: Object.values(weapons) };
}

function addWeaponStats(weaponID, weapons, legendFormat) {
	const weaponName = legendFormat[`weapon_${weaponID}`];
	return {
		...weapons,
		[weaponName]: {
			name: weaponName,
			legends: [
				...(weapons[weaponName] || { legends: [] }).legends,
				filterWeaponStats(legendFormat, weaponID)
			]
		}
	};
}

function formatLegendStats(staticLegend, legendStats = {}, legendRanked = {}) {
	const { legend_id: _sid, legend_name_key: _slnk, ...legendStats } = {
		...defaultLegendStats,
		...legendStats
	};
	const { legend_id: rid, legend_name_key: _rlnk, ...legendRanked } = {
		...defaultLegendSeason,
		...legendRanked
	};

	return {
		...staticLegend,
		...legendStats,
		damageweaponone: parseInt(legendStats.damageweaponone),
		damageweapontwo: parseInt(legendStats.damageweapontwo),
		season: {
			...legendRanked,
			rating_squash: getHeroRatingSquash(legendRanked.rating)
		}
	};
}

function getSeasonStats(seasonStats, teamsStats, legendsRanked) {
	const total_wins =
		seasonStats.wins + teamsStats.reduce((acc, t) => acc + t.wins, 0);

	const best_overall_rating = Math.max(
		seasonStats.peak_rating,
		...teamsStats.map(t => t.peak_rating),
		...legendsRanked.map(l => l.peak_rating)
	);

	return {
		...seasonStats,
		rating_squash: getPersonalRatingSquash(seasonStats.rating),
		total_wins,
		best_overall_rating,
		glory_best_rating: getGloryFromBestRating(best_overall_rating),
		glory_wins: getGloryFromWins(total_wins)
	};
}

function filterWeaponStats(legendFormat, weaponID) {
	const {
		id,
		name,
		damagedealt,
		kos,
		matchtime,
		games,
		wins,
		xp,
		level,
		[`damageweapon${weaponID}`]: damageweapon,
		[`koweapon${weaponID}`]: koweapon,
		[`timeheldweapon${weaponID}`]: timeheldweapon,
		season
	} = legendFormat;
	return {
		id,
		name,
		damagedealt,
		kos,
		matchtime,
		games,
		wins,
		xp,
		level,
		damageweapon,
		koweapon,
		timeheldweapon,
		season
	};
}

function formatWeaponStats(weapons) {
	return weapons.map(w => ({
		...w,
		...w.legends.reduce(
			(acc, l) => ({
				level: l.level + acc.level,
				xp: l.xp + acc.xp,
				matchtime: l.matchtime + acc.matchtime,
				damagedealt: l.damageweapon + acc.damagedealt,
				kos: l.koweapon + acc.kos,
				timeheld: l.timeheldweapon + acc.timeheld,
				season: {
					rating_acc: l.season.rating + acc.season.rating_acc,
					peak_rating_acc:
						l.season.peak_rating + acc.season.peak_rating_acc,
					best_rating:
						l.season.rating > acc.season.best_rating
							? l.season.rating
							: acc.season.best_rating,
					peak_rating:
						l.season.peak_rating > acc.season.peak_rating
							? l.season.peak_rating
							: acc.season.peak_rating,
					games: l.season.games + acc.season.games,
					wins: l.season.wins + acc.season.wins
				}
			}),
			defaultWeaponStats
		)
	}));
}

function formatTeamsStats(teamsStats) {
	return teamsStats.map(
		({
			brawlhalla_id_one,
			brawlhalla_id_two,
			teamname,
			region,
			global_rank: _tgr,
			...season
		}) => ({
			teammate_id:
				brawlhalla_id_one === _prid
					? brawlhalla_id_two
					: brawlhalla_id_one,
			teammate_name: cleanString(teamname.replace('+', ' & ')),
			region: regions[region],
			season: {
				...season,
				rating_squash: getHeroRatingSquash(season.rating)
			}
		})
	);
}

exports.formatPlayerStats = formatPlayerStats;
exports.formatLegendsAndWeaponsStats = formatLegendsAndWeaponsStats;
exports.addWeaponStats = addWeaponStats;
exports.formatLegendStats = formatLegendStats;
exports.getSeasonStats = getSeasonStats;
exports.filterWeaponStats = filterWeaponStats;
exports.formatWeaponStats = formatWeaponStats;
exports.formatTeamsStats = formatTeamsStats;
