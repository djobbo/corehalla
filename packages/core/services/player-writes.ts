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
    NewBHRankedQueue,
    NewBHPlayerWeapon,
} from "@crh/db/schema"
import type {
    Ladder,
    PlayerRanked,
    PlayerStats,
    Ranking1v1,
    Ranking2v2,
    Ranking3v3,
} from "@crh/bhapi/types"
import type { RankedRegion, RankedTier } from "@crh/bhapi/constants"

const MAX_LEGENDS_PER_PLAYER = 3
const MAX_WEAPONS_PER_PLAYER = 3

export type RankedSnapshot = {
    readonly rating: number
    readonly peak: number
    readonly games: number
    readonly wins: number
    readonly tier: RankedTier
    readonly region: RankedRegion
}

export const excludedSet = (
    row: Record<string, unknown>,
    conflictTarget: readonly string[],
): Record<string, ReturnType<typeof sql.raw>> =>
    // ON CONFLICT: every column except the conflict target must use excluded.col
    Object.fromEntries(
        Object.keys(row)
            .filter((column) => !conflictTarget.includes(column))
            .map((column) => [column, sql.raw(`excluded."${column}"`)]),
    )

export const RANKED_PLAYER_COLUMNS = [
    "rating",
    "peakRating",
    "rankedGames",
    "rankedWins",
    "tier",
    "region",
] as const

export const STATS_PLAYER_COLUMNS = [
    "xp",
    "level",
    "games",
    "wins",
    "damageDealt",
    "damageTaken",
    "kos",
    "falls",
    "suicides",
    "teamKos",
    "matchTime",
    "damageUnarmed",
    "matchTimeUnarmed",
    "koUnarmed",
    "damageThrownItem",
    "koThrownItem",
    "damageGadgets",
    "koGadgets",
] as const

const NO_RANKED_RECORD = "none"

/** v0 200 placeholder for never-placed: rating 0 or region/tier literal "none". */
const isNoRankedRecord = (ranked: PlayerRanked): boolean =>
    ranked.rating <= 0 ||
    String(ranked.region).trim().toLowerCase() === NO_RANKED_RECORD

export const snapshotFromRanked = (
    ranked: PlayerRanked | null,
): RankedSnapshot | null =>
    ranked === null || isNoRankedRecord(ranked)
        ? null
        : {
              rating: ranked.rating,
              peak: ranked.peak_rating,
              games: ranked.games,
              wins: ranked.wins,
              // null is top tier (Valhallan), not missing — v0 has no Valhallan literal.
              tier: ranked.tier ?? "Valhallan",
              region: ranked.region.toLowerCase() as RankedRegion,
          }

export const hasStorableName = (name: string | undefined): boolean =>
    typeof name === "string" && name.trim().length > 0

/** Omit list for excludedSet — callers must not overwrite columns they were not given. */
export const playerDataOmitColumns = (parts: {
    readonly stats: boolean
    readonly ranked: boolean
    /** Usable name, not merely a present `name` field. */
    readonly name: boolean
}): readonly string[] => [
    "id",
    ...(parts.name ? [] : ["name"]),
    ...(parts.ranked ? [] : RANKED_PLAYER_COLUMNS),
    ...(parts.stats ? [] : STATS_PLAYER_COLUMNS),
]

export const toPlayerDataRow = (
    playerStats: PlayerStats,
    ranked: RankedSnapshot | null,
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

        rating: ranked?.rating ?? 0,
        peakRating: ranked?.peak ?? 0,
        rankedGames: ranked?.games ?? 0,
        rankedWins: ranked?.wins ?? 0,
        tier: ranked?.tier ?? "",
        region: ranked?.region ?? "",
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

export const toPlayerRankedRow = (
    player: { readonly id: string; readonly name: string },
    ranked: RankedSnapshot,
): BHPlayerData => ({
    id: player.id,
    name: player.name,
    lastUpdated: new Date(),
    rating: ranked.rating,
    peakRating: ranked.peak,
    rankedGames: ranked.games,
    rankedWins: ranked.wins,
    tier: ranked.tier,
    region: ranked.region,
    xp: 0,
    level: 0,
    games: 0,
    wins: 0,
    damageDealt: 0,
    damageTaken: 0,
    kos: 0,
    falls: 0,
    suicides: 0,
    teamKos: 0,
    matchTime: 0,
    damageUnarmed: 0,
    matchTimeUnarmed: 0,
    koUnarmed: 0,
    damageThrownItem: 0,
    koThrownItem: 0,
    damageGadgets: 0,
    koGadgets: 0,
})

const queueBase = (
    row: Ranking1v1 | Ranking2v2 | Ranking3v3,
    bracket: Ladder,
    region: RankedRegion,
    seenAt: Date,
) => ({
    bracket,
    region,
    lastUpdated: seenAt,
    rating: row.rating,
    peakRating: row.peak_rating,
    tier: row.tier,
    games: row.games,
    wins: row.wins,
    rank: row.rank,
    // Deltas computed in SQL against previous row; zero on insert is honest.
    ratingDelta: 0,
    rankDelta: 0,
    // queuedAt is decided in SQL by comparing games — never guess here.
    queuedAt: null,
})

/** Tracks ladder entries (1v1/3v3 = player; 2v2 = team), not bare player ids. */
export const toRankedQueueRows = (
    bracket: Ladder,
    region: RankedRegion,
    rows: readonly (Ranking1v1 | Ranking2v2 | Ranking3v3)[],
    seenAt: Date,
): NewBHRankedQueue[] => {
    // Keyed to survive a malformed page that repeats an entry.
    const byKey = new Map<string, NewBHRankedQueue>()

    for (const row of rows) {
        if (bracket === "2v2") {
            const team = row as Ranking2v2

            // Zero id is Brawlhalla's "no player" sentinel on solo-queue rows.
            if (team.brawlhalla_id_one <= 0 || team.brawlhalla_id_two <= 0) {
                continue
            }

            const entry: NewBHRankedQueue = {
                ...queueBase(team, bracket, region, seenAt),
                entry_id: `${team.brawlhalla_id_one}-${team.brawlhalla_id_two}`,
                name_one: team.name_one,
                name_two: team.name_two,
                member_one_id: String(team.brawlhalla_id_one),
                member_two_id: String(team.brawlhalla_id_two),
            }

            byKey.set(entry.entry_id, entry)
            continue
        }

        const solo = row as Ranking1v1 | Ranking3v3

        if (solo.brawlhalla_id <= 0) continue

        const entry: NewBHRankedQueue = {
            ...queueBase(solo, bracket, region, seenAt),
            entry_id: String(solo.brawlhalla_id),
            name_one: solo.name,
            name_two: null,
            member_one_id: null,
            member_two_id: null,
        }

        byKey.set(entry.entry_id, entry)
    }

    return [...byKey.values()]
}

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
