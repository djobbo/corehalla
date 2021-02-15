import { cleanString } from './util';

import type {
	IPlayerStats,
	IPlayerRanked,
	IPlayerStatsFormat,
	IStaticLegendData,
	ILegendStats,
	ILegendRanked,
	Weapon,
	ILegendStatsFormat,
	IWeaponStatsFormat,
	I2v2Team,
	IPlayerSeason,
	IWeaponLegendFormat,
	IPlayerSeasonFormat,
	I2v2TeamFormat,
	IPlayerClan,
	IPlayerClanFormat,
} from 'corehalla';

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
	} = playerStats;

	const {
		legends: legendsRanked,
		['2v2']: teamsStats,
		brawlhalla_id: _prid,
		name: _prname,
		global_rank: _prgr,
		region_rank: _prrr,
		...seasonStats
	} = playerRanked;

	const { legends, weapons } = formatLegendsAndWeaponsStats(
		staticLegendsData,
		legendsStats,
		legendsRanked
	);

	const season = getSeasonStats(
		_prid,
		seasonStats,
		teamsStats,
		legendsRanked
	);

	return {
		id: generalStats.brawlhalla_id,
		name: cleanString(generalStats.name),
		xp: generalStats.xp,
		level: generalStats.level,
		xpPercentage: generalStats.xp_percentage,
		games: generalStats.games,
		wins: generalStats.wins,
		...legends.reduce<{
			kos: number;
			falls: number;
			suicides: number;
			teamkos: number;
			matchtime: number;
			damageDealt: number;
			damageTaken: number;
		}>(
			(acc, l) => ({
				kos: acc.kos + l.kos,
				falls: acc.falls + l.falls,
				suicides: acc.suicides + l.suicides,
				teamkos: acc.teamkos + l.teamkos,
				matchtime: acc.matchtime + l.matchtime,
				damageDealt: acc.damageDealt + l.damageDealt,
				damageTaken: acc.damageTaken + l.damageTaken,
			}),
			{
				kos: 0,
				falls: 0,
				suicides: 0,
				teamkos: 0,
				matchtime: 0,
				damageDealt: 0,
				damageTaken: 0,
			}
		),
		season,
		clan: clanStats ? formatClanStats(clanStats) : undefined,
		legends,
		weapons,
		gadgets: {
			bomb: {
				damage: parseInt(generalStats.damagebomb, 10),
				kos: generalStats.kobomb,
			},
			mine: {
				damage: parseInt(generalStats.damagemine, 10),
				kos: generalStats.komine,
			},
			spikeball: {
				damage: parseInt(generalStats.damagespikeball, 10),
				kos: generalStats.kospikeball,
			},
			sidekick: {
				damage: parseInt(generalStats.damagesidekick, 10),
				kos: generalStats.kosidekick,
			},
			snowball: {
				hits: generalStats.hitsnowball,
				kos: generalStats.kosnowball,
			},
		},
	};
}

export function formatClanStats({
	clan_id,
	clan_name,
	clan_xp,
	personal_xp,
}: IPlayerClan): IPlayerClanFormat {
	return {
		id: clan_id,
		name: cleanString(clan_name),
		xp: clan_xp,
		personalXp: personal_xp,
	};
}

export function formatLegendsAndWeaponsStats(
	staticLegends: IStaticLegendData[],
	legendsStats: ILegendStats[],
	legendsRanked: ILegendRanked[]
) {
	const { legends, weapons } = staticLegends.reduce<{
		legends: ILegendStatsFormat[];
		weapons: { [k in Weapon]?: IWeaponStatsFormat };
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
	return { legends, weapons: formatWeaponStats(Object.values(weapons)) };
}

const weaponProps: {
	name: 'weaponOne' | 'weaponTwo';
	damage: 'damageweaponone' | 'damageweapontwo';
	ko: 'koweaponone' | 'koweapontwo';
	timeheld: 'timeheldweaponone' | 'timeheldweapontwo';
}[] = [
	{
		name: 'weaponOne',
		damage: 'damageweaponone',
		ko: 'koweaponone',
		timeheld: 'timeheldweaponone',
	},
	{
		name: 'weaponTwo',
		damage: 'damageweapontwo',
		ko: 'koweapontwo',
		timeheld: 'timeheldweapontwo',
	},
];

export function addWeaponStats(
	weaponID: 0 | 1,
	weapons: { [k in Weapon]?: IWeaponStatsFormat },
	legendFormat: ILegendStatsFormat
) {
	const weaponName = legendFormat.weapons[weaponProps[weaponID].name].name;
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
	legendStats: ILegendStats = defaultLegendStats,
	legendRanked: ILegendRanked = defaultLegendSeason
): ILegendStatsFormat {
	return {
		id: staticLegend.id,
		name: staticLegend.name,
		xp: legendStats.xp,
		level: legendStats.level,
		xpPercentage: legendStats.xp_percentage,
		games: legendStats.games,
		wins: legendStats.wins,
		damageDealt: parseInt(legendStats.damagedealt, 10),
		damageTaken: parseInt(legendStats.damagetaken, 10),
		kos: legendStats.kos,
		falls: legendStats.falls,
		suicides: legendStats.suicides,
		teamkos: legendStats.teamkos,
		matchtime: legendStats.matchtime,
		weapons: {
			weaponOne: {
				name: staticLegend.weapon_one,
				damage: parseInt(legendStats.damageweaponone, 10),
				kos: legendStats.koweaponone,
				timeHeld: legendStats.timeheldweaponone,
			},
			weaponTwo: {
				name: staticLegend.weapon_two,
				damage: parseInt(legendStats.damageweapontwo, 10),
				kos: legendStats.koweapontwo,
				timeHeld: legendStats.timeheldweapontwo,
			},
			unarmed: {
				damage: parseInt(legendStats.damageunarmed, 10),
				kos: legendStats.kounarmed,
				timeHeld:
					legendStats.matchtime -
					(legendStats.timeheldweaponone +
						legendStats.timeheldweapontwo),
			},
			throws: {
				damage: parseInt(legendStats.damagethrownitem, 10),
				kos: legendStats.kothrownitem,
			},
			gadgets: {
				damage: parseInt(legendStats.damagegadgets, 10),
				kos: legendStats.kogadgets,
			},
		},
		season: {
			rating: legendRanked.rating,
			peak: legendRanked.peak_rating,
			tier: legendRanked.tier,
			wins: legendRanked.wins,
			games: legendRanked.games,
			ratingSquash: getHeroRatingSquash(legendRanked.rating),
		},
	};
}

export function getSeasonStats(
	playerID: number,
	{ peak_rating, wins, ...season }: IPlayerSeason,
	teamsStats: I2v2Team[],
	legendsRanked: ILegendRanked[]
): IPlayerSeasonFormat {
	const totalWins = wins + teamsStats.reduce((acc, t) => acc + t.wins, 0);

	const bestOverallRating = Math.max(
		peak_rating,
		...teamsStats.map((t) => t.peak_rating),
		...legendsRanked.map((l) => l.peak_rating)
	);

	return {
		...season,
		peak: peak_rating,
		wins,
		ratingSquash: getPersonalRatingSquash(season.rating),
		totalWins,
		bestOverallRating,
		glory: {
			bestRating: getGloryFromBestRating(bestOverallRating),
			wins: getGloryFromWins(totalWins),
		},
		teams: formatTeamsStats(playerID, teamsStats),
	};
}

export function filterWeaponStats(
	legendFormat: ILegendStatsFormat,
	weaponID: 0 | 1
): IWeaponLegendFormat {
	const { damage, kos, timeHeld } = legendFormat.weapons[
		weaponID === 0 ? 'weaponOne' : 'weaponTwo'
	];
	return {
		id: legendFormat.id,
		name: legendFormat.name,
		damageDealt: legendFormat.damageDealt,
		kos: legendFormat.kos,
		matchtime: legendFormat.games,
		games: legendFormat.games,
		wins: legendFormat.wins,
		xp: legendFormat.xp,
		level: legendFormat.level,
		weapon: {
			damage,
			kos,
			timeHeld,
		},
		season: legendFormat.season,
	};
}

export function formatWeaponStats(
	weapons: (IWeaponStatsFormat | undefined)[]
): IWeaponStatsFormat[] {
	return (weapons.filter((w) => w !== undefined) as IWeaponStatsFormat[]).map(
		(w) => ({
			...w,
			...w.legends.reduce<IWeaponStatsFormat>(
				(acc, l) => ({
					name: w.name,
					level: l.level + acc.level,
					xp: l.xp + acc.xp,
					matchtime: l.matchtime + acc.matchtime,
					damageDealt: l.weapon.damage + acc.damageDealt,
					kos: l.weapon.kos + acc.kos,
					timeHeld: l.weapon.timeHeld + acc.timeHeld,
					season: {
						ratingAcc: l.season.rating + acc.season.ratingAcc,
						peakAcc: l.season.peak + acc.season.peakAcc,
						bestRating:
							l.season.rating > acc.season.bestRating
								? l.season.rating
								: acc.season.bestRating,
						peak:
							l.season.peak > acc.season.peak
								? l.season.peak
								: acc.season.peak,
						games: l.season.games + acc.season.games,
						wins: l.season.wins + acc.season.wins,
					},
					legends: [...acc.legends, l],
				}),
				defaultWeaponStats
			),
		})
	);
}

export function formatTeamsStats(
	playerID: number,
	teamsStats: I2v2Team[]
): I2v2TeamFormat[] {
	return teamsStats
		.map<I2v2TeamFormat>(
			({
				brawlhalla_id_one,
				brawlhalla_id_two,
				teamname,
				region,
				global_rank: _tgr,
				peak_rating,
				...season
			}) => {
				const isPlayerOne = brawlhalla_id_one === playerID;
				const playerNames = teamname.split('+');

				return {
					playerAlias: cleanString(playerNames[+!isPlayerOne]),
					teammate: {
						id: isPlayerOne ? brawlhalla_id_two : brawlhalla_id_one,
						name: cleanString(playerNames[+isPlayerOne]),
					},
					region: regions[region - 2],
					season: {
						...season,
						peak: peak_rating,
						ratingSquash: getHeroRatingSquash(season.rating),
					},
				};
			}
		)
		.reduce<I2v2TeamFormat[]>(
			(acc, x) =>
				acc.find((y) => y.teammate.id === x.teammate.id)
					? acc
					: [...acc, x],
			[]
		);
}
