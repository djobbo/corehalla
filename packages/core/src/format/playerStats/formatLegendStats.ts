import { getHeroRatingSquash } from '~calc'
import { defaultLegendStats, defaultLegendSeason } from '~static'
import { IStaticLegendData, ILegendStats, ILegendRanked, ILegendStatsFormat } from '~types'

export const formatLegendStats = (
    staticLegend: IStaticLegendData,
    legendStats: ILegendStats = defaultLegendStats,
    legendRanked: ILegendRanked = defaultLegendSeason,
): ILegendStatsFormat => {
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
    }
}
