import { cleanString } from './util';

import {
	getGloryFromWins,
	getGloryFromBestRating,
	getHeroRatingSquash,
	getPersonalRatingSquash,
} from './gloryCalculator';

import {
	staticLegendsData,
	staticWeaponsData,
	regions,
	defaultLegendStats,
	defaultLegendSeason,
	defaultWeaponStats,
} from '../data/static-data';

export function formatPlayerStats(
	playerStats: IPlayerStats,
	playerRanked: IPlayerRanked
): IPlayerStatsFormat {
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
		teams: formatTeamsStats(_prid, teamsStats),
	};
}

export function formatLegendsAndWeaponsStats(
	staticLegendsData: IStaticLegendData[],
	legendsStats: ILegendStats[],
	legendsRanked: ILegendRanked[]
) {
	const { legends, weapons } = staticLegendsData.reduce<{
		legends: ILegendStatsFormat[];
		weapons: { [k in Weapon]: IWeaponStatsFormat };
	}>(
		(acc, staticLegend) => {
			const legendFormat = formatLegendStats(
				staticLegend,
				legendsStats.find((l) => l.legend_id === staticLegend.id),
				legendsRanked.find((l) => l.legend_id === staticLegend.id)
			);

			acc.legends = [...acc.legends, legendFormat];

			acc.weapons = addWeaponStats(0, acc.weapons, legendFormat);
			acc.weapons = addWeaponStats(1, acc.weapons, legendFormat);

			return acc;
		},
		{
			legends: [],
			weapons: staticWeaponsData,
		}
	);
	return { legends, weapons: Object.values(weapons) };
}

const weaponProps: {
	name: 'weapon_one' | 'weapon_two';
	damage: 'damageweaponone' | 'damageweapontwo';
	ko: 'koweaponone' | 'koweapontwo';
	timeheld: 'timeheldweaponone' | 'timeheldweapontwo';
}[] = [
	{
		name: 'weapon_one',
		damage: 'damageweaponone',
		ko: 'koweaponone',
		timeheld: 'timeheldweaponone',
	},
	{
		name: 'weapon_two',
		damage: 'damageweapontwo',
		ko: 'koweapontwo',
		timeheld: 'timeheldweapontwo',
	},
];

export function addWeaponStats(
	weaponID: 0 | 1,
	weapons: { [k in Weapon]: IWeaponStatsFormat },
	legendFormat: ILegendStatsFormat
) {
	const weaponName = legendFormat[weaponProps[weaponID].name];
	return {
		...weapons,
		[weaponName]: {
			name: weaponName,
			legends: [
				...(weapons[weaponName] || { legends: [] }).legends,
				filterWeaponStats(legendFormat, weaponID),
			],
		},
	};
}

export function formatLegendStats(
	staticLegend: IStaticLegendData,
	{
		legend_id: _sid,
		legend_name_key: _slnk,
		...legendStats
	}: ILegendStats = defaultLegendStats,
	{
		legend_id: rid,
		legend_name_key: _rlnk,
		...legendRanked
	}: ILegendRanked = defaultLegendSeason
) {
	return {
		...legendStats,
		damageweaponone: parseInt(legendStats.damageweaponone),
		damageweapontwo: parseInt(legendStats.damageweapontwo),
		season: {
			...legendRanked,
			rating_squash: getHeroRatingSquash(legendRanked.rating),
		},
		...staticLegend,
	};
}

export function getSeasonStats(
	seasonStats: IPlayerSeason,
	teamsStats: I2v2Team[],
	legendsRanked: ILegendRanked[]
) {
	const total_wins =
		seasonStats.wins + teamsStats.reduce((acc, t) => acc + t.wins, 0);

	const best_overall_rating = Math.max(
		seasonStats.peak_rating,
		...teamsStats.map((t) => t.peak_rating),
		...legendsRanked.map((l) => l.peak_rating)
	);

	return {
		...seasonStats,
		rating_squash: getPersonalRatingSquash(seasonStats.rating),
		total_wins,
		best_overall_rating,
		glory_best_rating: getGloryFromBestRating(best_overall_rating),
		glory_wins: getGloryFromWins(total_wins),
	};
}

export function filterWeaponStats(
	legendFormat: ILegendStatsFormat,
	weaponID: 0 | 1
): IWeaponLegendFormat {
	const { damage, ko, timeheld } = weaponProps[weaponID];
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
		[damage]: damageweapon,
		[ko]: koweapon,
		[timeheld]: timeheldweapon,
		season,
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
		season,
	};
}

export function formatWeaponStats(weapons: IWeaponStatsFormat[]) {
	return weapons.map((w) => ({
		...w,
		...w.legends.reduce<IWeaponStatsFormat>(
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
					wins: l.season.wins + acc.season.wins,
				},
				legends: [...acc.legends, l],
			}),
			defaultWeaponStats
		),
	}));
}

export function formatTeamsStats(playerID: number, teamsStats: I2v2Team[]) {
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
				brawlhalla_id_one === playerID
					? brawlhalla_id_two
					: brawlhalla_id_one,
			teammate_name: cleanString(teamname.replace('+', ' & ')),
			region: regions[region + 2],
			season: {
				...season,
				rating_squash: getHeroRatingSquash(season.rating),
			},
		})
	);
}
