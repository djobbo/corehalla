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
import type { PlayerRanked, PlayerStats } from "@crh/bhapi/types"
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

/**
 * The `BHPlayerData` columns that come from the ranked record rather than from
 * the career stats.
 *
 * Named so a writer that has no ranked record can exclude exactly these from
 * its `SET` clause. A stats-only write is not a partial row — the columns are
 * all there and the schema requires them — it is a write that declines to
 * overwrite facts it was not given.
 */
export const RANKED_PLAYER_COLUMNS = [
    "rating",
    "peakRating",
    "rankedGames",
    "rankedWins",
    "tier",
    "region",
] as const

/**
 * The `BHPlayerData` columns that come from the career stats alone.
 *
 * The mirror of the list above, and the reason both exist: two callers each
 * hold one half, and each has to know which columns are not its to write.
 * `name` appears in neither, because both payloads carry it — a rename is
 * visible from either path, so either may record it.
 */
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

/**
 * The 1v1 snapshot for a player whose own ranked record we hold.
 *
 * Shared by both write paths rather than kept private to the crawler: the
 * crawler reaches it from a 2v2 or 3v3 ladder row, and the profile's ranked
 * endpoint reaches it directly, and the two must agree on what a
 * `BHPlayerData` rating means.
 *
 * A player with no 1v1 record yields `null`. That is not a failure — the ranked
 * columns are `NOT NULL`, and inventing zeros would insert a player into the
 * 1v1 ladder who is not on it.
 *
 * `null` *inside* the record is a different thing entirely, and the tier below
 * is the one place the two nearly got confused: v0 reports the top tier as
 * null, so it is named rather than passed through.
 */
export const snapshotFromRanked = (
    ranked: PlayerRanked | null,
): RankedSnapshot | null =>
    ranked === null
        ? null
        : {
              rating: ranked.rating,
              peak: ranked.peak_rating,
              games: ranked.games,
              wins: ranked.wins,
              /*
               * `null` here is the top tier, not a missing value: v0 has no
               * "Valhallan" in its vocabulary and reports the tier above
               * Diamond as null. Casting it straight through, as this did,
               * wrote null into a `NOT NULL` column and would fail the insert
               * for exactly the players most likely to be on a leaderboard.
               * The name is the one the rest of the app already maps that null
               * to (`rankedBannerSrc`, `RankedCard`).
               */
              tier: ranked.tier ?? "Valhallan",
              // Our stored vocabulary is lowercase and v0 answers in one case
              // or the other depending on the field; the canonical form is the
              // one the region chips and flags are built from.
              region: ranked.region.toLowerCase() as RankedRegion,
          }

/**
 * Which `BHPlayerData` columns an upsert may overwrite.
 *
 * Returns the *omit* list `excludedSet` takes, so the answer lives here rather
 * than inline in the statement that builds the SQL. It is a decision about
 * ownership — a caller holding only one half does not own the other — and it
 * needs to be checkable without a database, because the failure it prevents is
 * silent: a profile view resetting a crawled player's tier to `""` would look
 * like missing data rather than like a write.
 *
 * `id` is always omitted: it is the conflict target, so setting it is either
 * redundant or a rename. `name` and `lastUpdated` are never omitted, because
 * every caller has both.
 */
export const playerDataOmitColumns = (parts: {
    readonly stats: boolean
    readonly ranked: boolean
}): readonly string[] => [
    "id",
    ...(parts.ranked ? [] : RANKED_PLAYER_COLUMNS),
    ...(parts.stats ? [] : STATS_PLAYER_COLUMNS),
]

/** The `BHPlayerData` row for a player, from their stats and ranked snapshot. */
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
        /*
         * Zeroed when the caller holds no ranked record, which is an ordinary
         * state rather than a failure: the profile's stats endpoint carries no
         * ranked data, and a player surfaced from a 2v2 or 3v3 ladder row has
         * no 1v1 record to read one from. These zeros only ever reach the
         * database on *insert* — a stats-only write keeps them out of `SET`,
         * so an existing row keeps whatever the crawler last recorded.
         */
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

/**
 * The `BHPlayerData` row for a player known only by their ranked record.
 *
 * The mirror of {@link toPlayerDataRow}: that one has the career stats and may
 * lack the standing, this one has the standing and lacks the career stats. Both
 * produce a complete row, because the schema has no partial ones — the
 * zero-filled half is a placeholder that only reaches the database on *insert*,
 * and `playerDataOmitColumns` keeps it out of `SET` so the other writer's real
 * numbers survive.
 *
 * Both writers race on a cold profile view, and the order they land in decides
 * which half is real for a moment. It resolves as soon as the second one
 * arrives, which is the same request round, so the only observable state is a
 * row that briefly has one half filled.
 */
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
    // The stats half, placeholders only.
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
