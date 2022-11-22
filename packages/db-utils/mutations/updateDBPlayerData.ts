import {
    getFullLegends,
    getFullWeapons,
    getLegendsAccumulativeData,
    getWeaponlessData,
    getWeaponsAccumulativeData,
} from "bhapi/legends"
import { supabaseService } from "db/supabase/service"
import type {
    BHPlayerData,
    BHPlayerLegend,
    BHPlayerWeapon,
} from "db/generated/client"
import type { FullLegend, FullWeapon } from "bhapi/legends"
import type { PlayerStats } from "bhapi/types"
import type { RankedRegion, RankedTier } from "bhapi/constants"

const MAX_LEGENDS_PER_PLAYER = 3
const MAX_WEAPONS_PER_PLAYER = 3

export const updateDBPlayerData = async (
    playerStats: PlayerStats,
    playerRanked: {
        rating: number
        peak: number
        games: number
        wins: number
        tier: RankedTier
        region: RankedRegion
    },
) => {
    const playerId = playerStats.brawlhalla_id.toString()
    console.log("updateDBPlayerData", { playerId })

    const legends = getFullLegends(playerStats.legends, undefined, false)

    const {
        matchtime,
        kos,
        falls,
        suicides,
        teamkos,
        damagedealt,
        damagetaken,
    } = getLegendsAccumulativeData(legends)

    const { unarmed, gadgets, throws } = getWeaponlessData(legends)

    const playerData: BHPlayerData = {
        id: playerId,
        name: playerStats.name,
        lastUpdated: new Date(),
        xp: playerStats.xp,
        level: playerStats.level,
        games: playerStats.games,
        wins: playerStats.wins,
        rating: playerRanked.rating,
        peakRating: playerRanked.peak,
        rankedGames: playerRanked.games,
        rankedWins: playerRanked.wins,
        tier: playerRanked.tier,
        region: playerRanked.region,
        damageDealt: damagedealt,
        damageTaken: damagetaken,
        kos,
        falls,
        suicides,
        teamKos: teamkos,
        matchTime: matchtime,
        damageUnarmed: unarmed.damageDealt,
        matchTimeUnarmed: unarmed.matchtime, // TODO
        koUnarmed: unarmed.kos,
        damageThrownItem: throws.damageDealt,
        koThrownItem: throws.kos,
        damageGadgets: gadgets.damageDealt,
        koGadgets: gadgets.kos,
    }

    const [{ error }] = await Promise.all([
        supabaseService.from<BHPlayerData>("BHPlayerData").upsert(playerData),
        updateDBPlayerLegends(playerId, legends),
    ])

    if (error) {
        console.error(
            `Failed to update player#${playerId}'s data in database`,
            error,
        )

        return
    }
}

export const updateDBPlayerLegends = async (
    playerId: string,
    legends: FullLegend[],
) => {
    console.log("updateDBPlayerLegends", { playerId })

    const dbLegends: BHPlayerLegend[] = legends.map((legend) => ({
        player_id: playerId,
        legend_id: legend.legend_id,
        lastUpdated: new Date(),
        damageDealt: parseInt(legend.stats.damagedealt),
        damageTaken: parseInt(legend.stats.damagetaken),
        kos: legend.stats.kos,
        falls: legend.stats.falls,
        suicides: legend.stats.suicides,
        teamKos: legend.stats.teamkos,
        matchTime: legend.stats.matchtime,
        games: legend.stats.games,
        wins: legend.stats.wins,
        damageUnarmed: parseInt(legend.stats.damageunarmed),
        damageThrownItem: parseInt(legend.stats.damagethrownitem),
        damageWeaponOne: parseInt(legend.stats.damageweaponone),
        damageWeaponTwo: parseInt(legend.stats.damageweapontwo),
        damageGadgets: parseInt(legend.stats.damagegadgets),
        koUnarmed: legend.stats.kounarmed,
        koThrownItem: legend.stats.kothrownitem,
        koWeaponOne: legend.stats.koweaponone,
        koWeaponTwo: legend.stats.koweapontwo,
        koGadgets: legend.stats.kogadgets,
        timeHeldWeaponOne: legend.stats.timeheldweaponone,
        timeHeldWeaponTwo: legend.stats.timeheldweapontwo,
        xp: legend.stats.xp,
        level: legend.stats.level,
    }))

    const weapons = getFullWeapons(legends)

    const [{ error }] = await Promise.all([
        supabaseService
            .from<BHPlayerLegend>("BHPlayerLegend")
            .upsert(
                dbLegends
                    .sort((a, b) => b.xp - a.xp)
                    .slice(0, MAX_LEGENDS_PER_PLAYER),
            ),
        updateDBPlayerWeapons(playerId, weapons),
    ])

    if (error) {
        console.error(
            `Failed to update player#${playerId}'s legends in database`,
            error,
        )

        return
    }
}

export const updateDBPlayerWeapons = async (
    playerId: string,
    fullWeapons: FullWeapon[],
) => {
    console.log("updateDBPlayerWeapons", { playerId })

    const weapons = getWeaponsAccumulativeData(fullWeapons)

    const { error } = await supabaseService
        .from<BHPlayerWeapon>("BHPlayerWeapon")
        .upsert(
            weapons
                .map((weapon) => ({
                    player_id: playerId,
                    weapon_name: weapon.weapon,
                    lastUpdated: new Date(),
                    kos: weapon.kos,
                    matchTime: weapon.matchtime,
                    games: weapon.games,
                    wins: weapon.wins,
                    damageDealt: weapon.damageDealt,
                    xp: weapon.xp,
                    level: weapon.level,
                }))
                .sort((a, b) => b.matchTime - a.matchTime)
                .slice(0, MAX_WEAPONS_PER_PLAYER),
        )

    if (error) {
        console.error(
            `Failed to update player#${playerId}'s weapons in database`,
            error,
        )
    }
}
