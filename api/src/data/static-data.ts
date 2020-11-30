import { legends } from './legends';

import { RankedRegion, ILegendStats, ILegendRanked, IWeaponStatsFormat, Weapon, RankedTier } from '../types';

export const staticLegendsData = legends;

export const regions: RankedRegion[] = ['US-E', 'EU', 'SEA', 'BRZ', 'AUS', 'US-W', 'JPN'];

export const defaultLegendStats: ILegendStats = {
    legend_id: 0,
    legend_name_key: '',
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
    xp_percentage: 0,
};

export const defaultLegendSeason: ILegendRanked = {
    legend_id: 0,
    legend_name_key: '',
    rating: 750,
    peak_rating: 750,
    tier: 'Tin 0',
    wins: 0,
    games: 0,
};

export const defaultWeaponStats: IWeaponStatsFormat = {
    name: 'Hammer',
    level: 0,
    xp: 0,
    matchtime: 0,
    damageDealt: 0,
    kos: 0,
    timeHeld: 0,
    season: {
        ratingAcc: 0,
        peakAcc: 0,
        bestRating: 0,
        peak: 750,
        games: 0,
        wins: 0,
    },
    legends: [],
};

export const staticWeaponsData = staticLegendsData.reduce<{ [k in Weapon]?: IWeaponStatsFormat }>(
    (acc, { weapon_one, weapon_two }) => ({
        ...acc,
        [weapon_one]: defaultWeaponStats,
        [weapon_two]: defaultWeaponStats,
    }),
    {},
);

type RankedTierThreshold = [RankedTier, number];

export const rankedTiers: RankedTierThreshold[] = [
    ['Diamond', 2000],
    ['Platinum 5', 1936],
    ['Platinum 4', 1872],
    ['Platinum 3', 1808],
    ['Platinum 2', 1744],
    ['Platinum 1', 1680],
    ['Gold 5', 1622],
    ['Gold 4', 1564],
    ['Gold 3', 1506],
    ['Gold 2', 1448],
    ['Gold 1', 1390],
    ['Gold 0', 1338],
    ['Silver 5', 1338],
    ['Silver 4', 1286],
    ['Silver 3', 1234],
    ['Silver 2', 1182],
    ['Silver 1', 1130],
    ['Silver 0', 1086],
    ['Bronze 5', 1086],
    ['Bronze 4', 1042],
    ['Bronze 3', 998],
    ['Bronze 2', 954],
    ['Bronze 1', 910],
    ['Bronze 0', 872],
    ['Tin 5', 872],
    ['Tin 4', 834],
    ['Tin 3', 796],
    ['Tin 2', 758],
    ['Tin 1', 720],
    ['Tin 0', 200],
];
