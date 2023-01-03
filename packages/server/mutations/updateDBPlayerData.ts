import {
    getFullLegends,
    getFullWeapons,
    getLegendsAccumulativeData,
    getWeaponlessData,
    getWeaponsAccumulativeData,
} from "bhapi/legends"
import { logError, logInfo } from "logger"
import { supabaseService } from "db/supabase/service"
import type { BHPlayerData } from "db/generated/client"
import type { BHPlayerLegend, BHPlayerWeapon } from "db/generated/client"
import type { CommonOptions } from "../helpers/commonOptions"
import type { FullLegend, FullWeapon } from "bhapi/legends"
import type { PlayerStats } from "bhapi/types"
import type { RankedRegion, RankedTier } from "bhapi/constants"

const MAX_LEGENDS_PER_PLAYER = 3
const MAX_WEAPONS_PER_PLAYER = 3

export const sortablePlayerProps = [
    "xp",
    "games",
    "wins",
    "rankedGames",
    "rankedWins",
    "damageDealt",
    "damageTaken",
    "kos",
    "falls",
    "suicides",
    "teamKos",
    "matchTime",
    "damageUnarmed",
    "koUnarmed",
    "matchTimeUnarmed",
    "koThrownItem",
    "damageThrownItem",
    "koGadgets",
    "damageGadgets",
] as const satisfies readonly (keyof BHPlayerData)[]

export type SortablePlayerProp = typeof sortablePlayerProps[number]

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
    options: CommonOptions,
) => {
    const playerId = playerStats.brawlhalla_id.toString()
    logInfo("updateDBPlayerData", { playerId })

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
        supabaseService
            .from<BHPlayerData>("BHPlayerData")
            .upsert(playerData)
            .abortSignal(options.abortSignal),
        updateDBPlayerLegends(playerId, legends, options),
    ])

    if (error) {
        logError(
            `Failed to update player#${playerId}'s data in database`,
            error,
        )

        return
    }
}

export const updateDBPlayerLegends = async (
    playerId: string,
    legends: FullLegend[],
    options: CommonOptions,
) => {
    logInfo("updateDBPlayerLegends", { playerId })

    const dbLegends: BHPlayerLegend[] = legends.map((legend) => {
        return {
            player_id: playerId,
            legend_id: legend.legend_id,
            lastUpdated: new Date(),
            ...(legend.stats
                ? {
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
                  }
                : {
                      damageDealt: 0,
                      damageTaken: 0,
                      kos: 0,
                      falls: 0,
                      suicides: 0,
                      teamKos: 0,
                      matchTime: 0,
                      games: 0,
                      wins: 0,
                      damageUnarmed: 0,
                      damageThrownItem: 0,
                      damageWeaponOne: 0,
                      damageWeaponTwo: 0,
                      damageGadgets: 0,
                      koUnarmed: 0,
                      koThrownItem: 0,
                      koWeaponOne: 0,
                      koWeaponTwo: 0,
                      koGadgets: 0,
                      timeHeldWeaponOne: 0,
                      timeHeldWeaponTwo: 0,
                      xp: 0,
                      level: 0,
                  }),
        }
    })

    const weapons = getFullWeapons(legends)

    const [{ error }] = await Promise.all([
        supabaseService
            .from<BHPlayerLegend>("BHPlayerLegend")
            .upsert(
                dbLegends
                    .sort((a, b) => b.xp - a.xp)
                    .slice(0, MAX_LEGENDS_PER_PLAYER),
            )
            .abortSignal(options.abortSignal),
        updateDBPlayerWeapons(playerId, weapons, options),
    ])

    if (error) {
        logError(
            `Failed to update player#${playerId}'s legends in database`,
            error,
        )

        return
    }
}

export const updateDBPlayerWeapons = async (
    playerId: string,
    fullWeapons: FullWeapon[],
    options: CommonOptions,
) => {
    logInfo("updateDBPlayerWeapons", { playerId })

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
        .abortSignal(options.abortSignal)

    if (error) {
        logError(
            `Failed to update player#${playerId}'s weapons in database`,
            error,
        )
    }
}
