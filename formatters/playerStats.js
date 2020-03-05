const staticLegendsData = require('../data/legends.json');

const regions = ['', '', 'US-E', 'EU', 'SEA', 'BRZ', 'AUS', 'US-W', 'JPN'];

const defaultLegendStats = {
	damagedealt: '0',
	damagetaken: '0',
	kos: 0,
	falls: 0,
	suicides: 0,
	teamkos: 0,
	matchtime: 0,
	games: 0,
	wins: 0,
	damageunarmed: '0',
	damagethrownitem: '0',
	damageweaponone: '0',
	damageweapontwo: '0',
	damagegadgets: '0',
	kounarmed: 0,
	kothrownitem: 0,
	koweaponone: 0,
	koweapontwo: 0,
	kogadgets: 0,
	timeheldweaponone: 0,
	timeheldweapontwo: 0,
	xp: 0,
	level: 1,
	xp_percentage: 0
};

const defaultLegendSeason = {
	rating: 750,
	peak_rating: 750,
	tier: 'Tin 0',
	wins: 0,
	games: 0
};

module.exports = (playerStats, playerRanked) => {
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
	const { legends, weapons } = staticLegendsData.reduce(
		(acc, staticLegend) => {
			const {
				legend_id: _sid,
				legend_name_key: _slnk,
				...legendStats
			} = {
				...defaultLegendStats,
				...(legendsStats.find(l => l.legend_id === staticLegend.id) ||
					{})
			};
			const {
				legend_id: rid,
				legend_name_key: _rlnk,
				...legendRanked
			} = {
				...defaultLegendSeason,
				...(legendsRanked.find(l => l.legend_id === staticLegend.id) ||
					{})
			};

			const legendFormat = {
				...staticLegend,
				...legendStats,
				damageweaponone: parseInt(legendStats.damageweaponone),
				damageweapontwo: parseInt(legendStats.damageweapontwo),
				season: legendRanked
			};

			acc.legends[staticLegend.name] = legendFormat;

			const weapon_one = Object.keys(acc.weapons).find(
				w => w === staticLegend.weapon_one
			);

			if (!weapon_one)
				acc.weapons[staticLegend.weapon_one] = {
					name: staticLegend.weapon_one,
					legends: []
				};

			const weapon_two = Object.keys(acc.weapons).find(
				w => w === staticLegend.weapon_two
			);
			if (!weapon_two)
				acc.weapons[staticLegend.weapon_two] = {
					name: staticLegend.weapon_two,
					legends: []
				};

			acc.weapons[staticLegend.weapon_one].legends.push(
				filterWeaponStats(legendFormat, 'one')
			);
			acc.weapons[staticLegend.weapon_two].legends.push(
				filterWeaponStats(legendFormat, 'two')
			);

			return acc;
		},
		{
			legends: {},
			weapons: {}
		}
	);
	return {
		...generalStats,
		season: seasonStats,
		clan: clanStats,
		legends: Object.values(legends),
		weapons: Object.values(weapons).map(w => ({
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
				{
					level: 0,
					xp: 0,
					matchtime: 0,
					damagedealt: 0,
					kos: 0,
					timeheld: 0,
					season: {
						rating_acc: 0,
						peak_rating_acc: 0,
						best_rating: 0,
						peak_rating: 750,
						games: 0,
						wins: 0
					}
				}
			)
		})),
		teams: teamsStats.map(
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
				season
			})
		)
	};
};

function filterWeaponStats(legendFormat, weapon) {
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
		[`damageweapon${weapon}`]: damageweapon,
		[`koweapon${weapon}`]: koweapon,
		[`timeheldweapon${weapon}`]: timeheldweapon,
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

function cleanString(str) {
	try {
		return decodeURIComponent(escape(str));
	} catch (e) {
		return str;
	}
}
