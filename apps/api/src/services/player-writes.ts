import { sql } from "@crh/db/query"
import {
    getFullLegends,
    getFullWeapons,
    getLegendsAccumulativeData,
    getWeaponlessData,
    getWeaponsAccumulativeData,
} from "@crh/bhapi/legends"
import type { FullLegend } from "@crh/bhapi/legends"
import type {
    BHPlayerData,
    NewBHPlayerLegend,
    NewBHPlayerWeapon,
} from "@crh/db/schema"
import type { PlayerStats } from "@crh/bhapi/types"
import type { RankedRegion, RankedTier } from "@crh/bhapi/constants"

/**
 * Row builders for the player archive.
 *
 * Pure functions so the mapping from an upstream payload to our tables can be
 * read — and tested — without a database. The crawler and any future
 * fetch-on-view path share them, which keeps a player's stored shape identical
 * however they entered the table.
 *
 * The writes themselves live in `archive.ts`, which owns the database handle.
 */

/** How many of a player's legends and weapons are worth storing. */
const MAX_LEGENDS_PER_PLAYER = 3
const MAX_WEAPONS_PER_PLAYER = 3

/**
 * The ranked facts the leaderboard row already carries.
 *
 * Taken from the ranking row rather than a separate `/player/{id}/ranked` call:
 * the ladder told us the rating when it handed us the player.
 */
export type RankedSnapshot = {
    readonly rating: number
    readonly peak: number
    readonly games: number
    readonly wins: number
    readonly tier: RankedTier
    readonly region: RankedRegion
}

/**
 * `SET col = excluded.col` for every column except the conflict target.
 *
 * This is what makes a multi-row upsert correct, and it replaces a real bug.
 * The previous implementation built its `set` from a plain object of *literal*
 * values read off `rows[0]`:
 *
 * ```ts
 * set: onConflictUpdateFrom(topLegends[0], ["player_id", "legend_id"])
 * ```
 *
 * Drizzle emits one `SET` clause for the whole statement, so on conflict every
 * row in the batch was written with `topLegends[0]`'s statistics — the second
 * and third legends silently inherited the first one's numbers. Its doc comment
 * even claimed `excluded` semantics that the code never produced.
 *
 * Referring to `excluded` per column lets SQLite use the row each insert
 * proposed, which is what "last write wins" actually requires.
 */
export const excludedSet = (
    row: Record<string, unknown>,
    conflictTarget: readonly string[],
): Record<string, ReturnType<typeof sql.raw>> =>
    Object.fromEntries(
        Object.keys(row)
            .filter((column) => !conflictTarget.includes(column))
            .map((column) => [column, sql.raw(`excluded."${column}"`)]),
    )

/** The `BHPlayerData` row for a player, from their stats and ranked snapshot. */
export const toPlayerDataRow = (
    playerStats: PlayerStats,
    ranked: RankedSnapshot,
): BHPlayerData => {
    const legends = getFullLegends(
        playerStats.legends,
        undefined,
        false,
    ) as FullLegend[]

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

    return {
        id: playerStats.brawlhalla_id.toString(),
        name: playerStats.name,
        lastUpdated: new Date(),
        xp: playerStats.xp,
        level: playerStats.level,
        games: playerStats.games,
        wins: playerStats.wins,
        rating: ranked.rating,
        peakRating: ranked.peak,
        rankedGames: ranked.games,
        rankedWins: ranked.wins,
        tier: ranked.tier,
        region: ranked.region,
        damageDealt: damagedealt,
        damageTaken: damagetaken,
        kos,
        falls,
        suicides,
        teamKos: teamkos,
        matchTime: matchtime,
        damageUnarmed: unarmed.damageDealt,
        matchTimeUnarmed: unarmed.matchtime,
        koUnarmed: unarmed.kos,
        damageThrownItem: throws.damageDealt,
        koThrownItem: throws.kos,
        damageGadgets: gadgets.damageDealt,
        koGadgets: gadgets.kos,
    }
}

/**
 * The player's most-played legends, ranked by XP.
 *
 * A legend with no stats block still gets a row (zero-filled) so its existence
 * is recorded, which is why the zero branch survives.
 */
export const toLegendRows = (
    playerId: string,
    playerStats: PlayerStats,
): NewBHPlayerLegend[] => {
    const legends = getFullLegends(
        playerStats.legends,
        undefined,
        false,
    ) as FullLegend[]
    const seenAt = new Date()

    return legends
        .map((legend): NewBHPlayerLegend => {
            const base = {
                player_id: playerId,
                legend_id: legend.legend_id,
                lastUpdated: seenAt,
            }

            if (!legend.stats) {
                return {
                    ...base,
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
                }
            }

            return {
                ...base,
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
        })
        .sort((a, b) => b.xp - a.xp)
        .slice(0, MAX_LEGENDS_PER_PLAYER)
}

/** The player's most-used weapons, ranked by time held. */
export const toWeaponRows = (
    playerId: string,
    playerStats: PlayerStats,
): NewBHPlayerWeapon[] => {
    const legends = getFullLegends(
        playerStats.legends,
        undefined,
        false,
    ) as FullLegend[]
    const weapons = getWeaponsAccumulativeData(getFullWeapons(legends))
    const seenAt = new Date()

    return weapons
        .map((weapon) => ({
            player_id: playerId,
            weapon_name: weapon.weapon,
            lastUpdated: seenAt,
            kos: weapon.kos,
            matchTime: weapon.matchtime,
            games: weapon.games,
            wins: weapon.wins,
            damageDealt: weapon.damageDealt,
            xp: weapon.xp,
            level: weapon.level,
        }))
        .sort((a, b) => b.matchTime - a.matchTime)
        .slice(0, MAX_WEAPONS_PER_PLAYER)
}
