import { cleanString } from './util/cleanString';

import type {
    IPlayerStats,
    IPlayerRanked,
    IPlayerStatsFormat,
    IStaticLegendData,
    ILegendStats,
    ILegendRanked,
    ILegendStatsFormat,
    IWeaponStatsFormat,
    I2v2Team,
    IPlayerSeasonFormat,
    I2v2TeamFormat,
    IPlayerClan,
    IPlayerClanFormat,
} from '@corehalla/types';

import {
    getGloryFromWins,
    getGloryFromBestRating,
    getHeroRatingSquash,
    getPersonalRatingSquash,
} from '@corehalla/glory-calc';

import {
    staticLegendsData,
    regions,
    defaultLegendStats,
    defaultLegendSeason,
    defaultWeaponStats,
} from '@corehalla/static';

export function formatPlayerStats(
    playerStats: IPlayerStats | undefined,
    playerRanked: IPlayerRanked | undefined,
): IPlayerStatsFormat {
    // const { legends: legendsStats, clan: clanStats, ...generalStats } = playerStats ?? {};

    // const { legends, weapons } = formatLegendsAndWeaponsStats(staticLegendsData, legendsStats, legendsRanked);

    const legends = formatLegendsStats(staticLegendsData, playerStats?.legends, playerRanked?.legends);

    const season = getSeasonStats(playerRanked);

    const globalStats = legends.reduce<{
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
        },
    );

    const gadgets = {
        bomb: {
            damage: parseInt(playerStats?.damagebomb ?? '0', 10),
            kos: playerStats?.kobomb ?? 0,
        },
        mine: {
            damage: parseInt(playerStats?.damagemine ?? '0', 10),
            kos: playerStats?.komine ?? 0,
        },
        spikeball: {
            damage: parseInt(playerStats?.damagespikeball ?? '0', 10),
            kos: playerStats?.kospikeball ?? 0,
        },
        sidekick: {
            damage: parseInt(playerStats?.damagesidekick ?? '0', 10),
            kos: playerStats?.kosidekick ?? 0,
        },
        snowball: {
            hits: playerStats?.hitsnowball ?? 0,
            kos: playerStats?.kosnowball ?? 0,
        },
    };

    return {
        id: playerStats?.brawlhalla_id ?? -1,
        name: cleanString(playerStats?.name ?? ''),
        xp: playerStats?.xp ?? 0,
        level: playerStats?.level ?? 0,
        xpPercentage: playerStats?.xp_percentage ?? 0,
        games: playerStats?.games ?? 0,
        wins: playerStats?.wins ?? 0,
        legends,
        season,
        ...globalStats,
        clan: formatClanStats(playerStats?.clan),
        gadgets,
    };

    // return {
    //     id: generalStats.brawlhalla_id,
    //     name: cleanString(generalStats.name),
    //     xp: generalStats.xp,
    //     level: generalStats.level,
    //     xpPercentage: generalStats.xp_percentage,
    //     games: generalStats.games,
    //     wins: generalStats.wins,
    //     ...legends.reduce<{
    //         kos: number;
    //         falls: number;
    //         suicides: number;
    //         teamkos: number;
    //         matchtime: number;
    //         damageDealt: number;
    //         damageTaken: number;
    //     }>(
    //         (acc, l) => ({
    //             kos: acc.kos + l.kos,
    //             falls: acc.falls + l.falls,
    //             suicides: acc.suicides + l.suicides,
    //             teamkos: acc.teamkos + l.teamkos,
    //             matchtime: acc.matchtime + l.matchtime,
    //             damageDealt: acc.damageDealt + l.damageDealt,
    //             damageTaken: acc.damageTaken + l.damageTaken,
    //         }),
    //         {
    //             kos: 0,
    //             falls: 0,
    //             suicides: 0,
    //             teamkos: 0,
    //             matchtime: 0,
    //             damageDealt: 0,
    //             damageTaken: 0,
    //         },
    //     ),
    //     season,
    //     clan: clanStats ? formatClanStats(clanStats) : undefined,
    //     legends,
    //     weapons,
    //     gadgets: {
    //         bomb: {
    //             damage: parseInt(generalStats.damagebomb, 10),
    //             kos: generalStats.kobomb,
    //         },
    //         mine: {
    //             damage: parseInt(generalStats.damagemine, 10),
    //             kos: generalStats.komine,
    //         },
    //         spikeball: {
    //             damage: parseInt(generalStats.damagespikeball, 10),
    //             kos: generalStats.kospikeball,
    //         },
    //         sidekick: {
    //             damage: parseInt(generalStats.damagesidekick, 10),
    //             kos: generalStats.kosidekick,
    //         },
    //         snowball: {
    //             hits: generalStats.hitsnowball,
    //             kos: generalStats.kosnowball,
    //         },
    //     },
    // };
}

export function formatClanStats(clan?: IPlayerClan): IPlayerClanFormat | undefined {
    if (!clan) return;

    const { clan_id, clan_name, clan_xp, personal_xp } = clan;
    return {
        id: clan_id,
        name: cleanString(clan_name),
        xp: clan_xp,
        personalXp: personal_xp,
    };
}

export function formatLegendsStats(
    staticLegends: IStaticLegendData[],
    legendsStats: ILegendStats[] | undefined,
    legendsRanked: ILegendRanked[] | undefined,
): ILegendStatsFormat[] {
    return staticLegends.map((legend) => {
        const legendStats = legendsStats?.find((l) => l.legend_id === legend.id);
        const legendRanked = legendsRanked?.find((l) => l.legend_id === legend.id);
        return formatLegendStats(legend, legendStats, legendRanked);
    });
}

// export function formatWeaponsStats(legends: ILegendStatsFormat[]) {
//     // const legendsWithWeapons: Record<Weapon, ILegendStatsFormat[]> = {
//     //     Hammer: [],
//     //     Sword: [],
//     //     Blasters: [],
//     //     'Rocket Lance': [],
//     //     Spear: [],
//     //     Katars: [],
//     //     Axe: [],
//     //     Bow: [],
//     //     Gauntlets: [],
//     //     Scythe: [],
//     //     Cannon: [],
//     //     Orb: [],
//     //     Greatsword: [],
//     // };

//     // // Could have used reduce but type checking isn't on point.
//     // for (const legend of legends) {
//     //     const { weaponOne, weaponTwo, unarmed, gadgets, throws } = legend.weapons;
//     //     weapons[weaponOne.name] = [...weapons[weaponOne.name], legend];
//     //     weapons[weaponTwo.name] = [...weapons[weaponOne.name], legend];
//     // }

//     const a = legends.reduce<Partial<Record<Weapon, IWeaponStatsFormat[]>>>((weapons, legend) => {
//         const { weaponOne, weaponTwo } = legend.weapons;
//         return {
//             ...weapons,
//             [weaponOne.name]: [...(weapons[weaponOne.name] || [])],
//             [weaponTwo.name]: [...(weapons[weaponTwo.name] || [])],
//         };
//     }, {});
// }

// export function filterWeaponStats(legendFormat: ILegendStatsFormat, weaponID: 0 | 1): IWeaponLegendFormat {
//     const { damage, kos, timeHeld } = legendFormat.weapons[weaponID === 0 ? 'weaponOne' : 'weaponTwo'];
//     return {
//         id: legendFormat.id,
//         name: legendFormat.name,
//         damageDealt: legendFormat.damageDealt,
//         kos: legendFormat.kos,
//         matchtime: legendFormat.games,
//         games: legendFormat.games,
//         wins: legendFormat.wins,
//         xp: legendFormat.xp,
//         level: legendFormat.level,
//         weapon: {
//             damage,
//             kos,
//             timeHeld,
//         },
//         season: legendFormat.season,
//     };
// }

// export function formatLegendsAndWeaponsStats(
//     staticLegends: IStaticLegendData[],
//     legendsStats: ILegendStats[],
//     legendsRanked: ILegendRanked[],
// ): {
//     legends: ILegendStatsFormat[];
//     weapons: IWeaponStatsFormat[];
// } {
//     const { legends, weapons } = staticLegends.reduce<{
//         legends: ILegendStatsFormat[];
//         weapons: { [k in Weapon]?: IWeaponStatsFormat };
//     }>(
//         (acc, staticLegend) => {
//             const legendFormat = formatLegendStats(
//                 staticLegend,
//                 legendsStats.find((l) => l.legend_id === staticLegend.id),
//                 legendsRanked.find((l) => l.legend_id === staticLegend.id),
//             );

//             acc.legends = [...acc.legends, legendFormat];

//             acc.weapons = addWeaponStats(0, acc.weapons, legendFormat);
//             acc.weapons = addWeaponStats(1, acc.weapons, legendFormat);

//             return acc;
//         },
//         {
//             legends: [],
//             weapons: staticWeaponsData,
//         },
//     );
//     return { legends, weapons: formatWeaponStats(Object.values(weapons)) };
// }

// const weaponProps: {
//     name: 'weaponOne' | 'weaponTwo';
//     damage: 'damageweaponone' | 'damageweapontwo';
//     ko: 'koweaponone' | 'koweapontwo';
//     timeheld: 'timeheldweaponone' | 'timeheldweapontwo';
// }[] = [
//     {
//         name: 'weaponOne',
//         damage: 'damageweaponone',
//         ko: 'koweaponone',
//         timeheld: 'timeheldweaponone',
//     },
//     {
//         name: 'weaponTwo',
//         damage: 'damageweapontwo',
//         ko: 'koweapontwo',
//         timeheld: 'timeheldweapontwo',
//     },
// ];

// // export function addWeaponStats(
// //     weaponID: 0 | 1,
// //     weapons: { [k in Weapon]?: IWeaponStatsFormat },
// //     legendFormat: ILegendStatsFormat,
// // ): Partial<Record<Weapon, IWeaponStatsFormat>> {
// //     const weaponName = legendFormat.weapons[weaponProps[weaponID].name].name;
// //     return {
// //         ...weapons,
// //         [weaponName]: {
// //             name: weaponName,
// //             legends: [...(weapons[weaponName] || { legends: [] }).legends, filterWeaponStats(legendFormat, weaponID)],
// //         },
// //     };
// // }

export function formatLegendStats(
    staticLegend: IStaticLegendData,
    legendStats: ILegendStats = defaultLegendStats,
    legendRanked: ILegendRanked = defaultLegendSeason,
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
                timeHeld: legendStats.matchtime - (legendStats.timeheldweaponone + legendStats.timeheldweapontwo),
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

export function getSeasonStats(playerRanked?: IPlayerRanked): IPlayerSeasonFormat {
    const {
        brawlhalla_id: playerID,
        rating = NaN,
        peak_rating = NaN,
        games = 0,
        wins = 0,
        tier = 'Unranked',
        region = 'US-W',
        ['2v2']: teams = [],
        legends = [],
    } = playerRanked ?? {};

    const totalWins = wins + teams.reduce((acc, team) => acc + team.wins, 0);

    const bestOverallRating = Math.max(
        peak_rating,
        ...teams.map((team) => team.peak_rating),
        ...legends.map((legend) => legend.peak_rating),
    );

    return {
        rating,
        games,
        tier,
        peak: peak_rating,
        wins,
        region,
        ratingSquash: getPersonalRatingSquash(rating),
        totalWins,
        bestOverallRating,
        glory: {
            bestRating: getGloryFromBestRating(bestOverallRating),
            wins: getGloryFromWins(totalWins),
        },
        teams: playerID === undefined ? [] : formatTeamsStats(playerID, teams),
    };
}

export function formatWeaponStats(weapons: (IWeaponStatsFormat | undefined)[]): IWeaponStatsFormat[] {
    return (weapons.filter((w) => w !== undefined) as IWeaponStatsFormat[]).map((w) => ({
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
                    bestRating: l.season.rating > acc.season.bestRating ? l.season.rating : acc.season.bestRating,
                    peak: l.season.peak > acc.season.peak ? l.season.peak : acc.season.peak,
                    games: l.season.games + acc.season.games,
                    wins: l.season.wins + acc.season.wins,
                },
                legends: [...acc.legends, l],
            }),
            defaultWeaponStats,
        ),
    }));
}

export function formatTeamsStats(playerID: number, teamsStats: I2v2Team[]): I2v2TeamFormat[] {
    return teamsStats
        .map<I2v2TeamFormat>(
            ({ brawlhalla_id_one, brawlhalla_id_two, teamname, region, global_rank: _, peak_rating, ...season }) => {
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
            },
        )
        .reduce<I2v2TeamFormat[]>(
            (acc, x) => (acc.find((y) => y.teammate.id === x.teammate.id) ? acc : [...acc, x]),
            [],
        );
}
