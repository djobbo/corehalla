import { getEntitySlug } from "@crh/common/helpers/entitySlug"
import { rankedRegions } from "@crh/bhapi/constants"
import { getTeamPlayers } from "@crh/bhapi/helpers/getTeamPlayers"
import {
    getFullLegends,
    getFullWeapons,
    getLegendsAccumulativeData,
    getWeaponlessData,
    getWeaponsAccumulativeData,
} from "@crh/bhapi/legends"
import { legendRatingReset, personalRatingReset, seasonSummary } from "./season"
import type { FullLegend } from "@crh/bhapi/legends"
import type {
    Clan,
    Player3v3Ranked,
    PlayerRanked,
    PlayerStats,
} from "@crh/bhapi/types"
import type {
    PlayerEnvelope,
    PlayerLegend,
    PlayerRankedTeam,
    PlayerWeapon,
} from "@crh/api-contract/schemas"

/**
 * Assembles the whole player profile from the pieces the gateway hands back.
 *
 * This is corehalla's answer to kubi's `getPlayerById`: the four reads a
 * profile used to make from the browser — career stats, v0 ranked, v1 3v3 and
 * the alias index — plus every roll-up the tabs rendered are resolved here,
 * once, into one payload.
 *
 * The work is deliberately pure. Everything that needs a network or a database
 * is a parameter, so the assembly rules — which bracket counts toward glory,
 * what a missing legend stat becomes, how a solo-queue 2v2 row is marked — are
 * testable without either, and a wrong number can be traced to a decision
 * rather than to a response.
 */

/** The number a v1 payload spells as a string, or `0` when it is absent. */
const int = (value: string | number | undefined): number =>
    typeof value === "number" ? value : Number.parseInt(value ?? "0", 10)

/** A region as our lowercase vocabulary, or `null` when the source has none. */
const regionOf = (region: string | undefined | null): string | null =>
    region ? region.toLowerCase() : null

/**
 * The player's former names, in the order the archive returned them.
 *
 * That order is `createdAt DESC` — most recently first seen — which is the order
 * the profile header has always shown them in. The current name is dropped
 * rather than repeated as its own alias, and duplicates are collapsed because
 * two spellings of the same name differing only in case are the same alias to a
 * reader.
 */
const aliasList = (
    aliases: readonly string[],
    currentName: string,
): readonly string[] => {
    const seen = new Set<string>([currentName.trim().toLowerCase()])
    const result: string[] = []

    for (const alias of aliases) {
        const key = alias.trim().toLowerCase()

        if (key.length === 0 || seen.has(key)) continue

        seen.add(key)
        result.push(alias)
    }

    return result
}

/** One legend's record, with both weapon slots and its ranked standing. */
const toLegend = (legend: FullLegend): PlayerLegend => {
    const stats = legend.stats
    const weaponOneHeld = stats?.timeheldweaponone ?? 0
    const weaponTwoHeld = stats?.timeheldweapontwo ?? 0
    const matchtime = stats?.matchtime ?? 0
    const ranked = legend.ranked

    return {
        id: legend.legend_id,
        name: legend.bio_name,
        name_key: legend.legend_name_key,
        slug: getEntitySlug(legend.legend_id, legend.bio_name),
        stats: {
            xp: stats?.xp ?? 0,
            level: stats?.level ?? 0,
            // A capped legend reports `100` rather than whatever fraction the
            // upstream left behind, the same normalisation the old client did.
            xp_percentage:
                stats?.level === 100 ? 100 : (stats?.xp_percentage ?? 0),
            damage_dealt: int(stats?.damagedealt),
            damage_taken: int(stats?.damagetaken),
            kos: stats?.kos ?? 0,
            falls: stats?.falls ?? 0,
            suicides: stats?.suicides ?? 0,
            team_kos: stats?.teamkos ?? 0,
            matchtime,
            games: stats?.games ?? 0,
            wins: stats?.wins ?? 0,
        },
        weapon_one: {
            name: legend.weapon_one,
            damage_dealt: int(stats?.damageweaponone),
            kos: stats?.koweaponone ?? 0,
            time_held: weaponOneHeld,
        },
        weapon_two: {
            name: legend.weapon_two,
            damage_dealt: int(stats?.damageweapontwo),
            kos: stats?.koweapontwo ?? 0,
            time_held: weaponTwoHeld,
        },
        unarmed: {
            damage_dealt: int(stats?.damageunarmed),
            kos: stats?.kounarmed ?? 0,
            // Not reported directly: "match time not spent holding a weapon"
            // is the definition, and the two weapon timers are the only other
            // occupiers of it. Clamped because a payload whose timers exceed
            // its match time would otherwise render a negative duration.
            time_held: Math.max(0, matchtime - weaponOneHeld - weaponTwoHeld),
        },
        gadgets: {
            damage_dealt: int(stats?.damagegadgets),
            kos: stats?.kogadgets ?? 0,
        },
        weapon_throws: {
            damage_dealt: int(stats?.damagethrownitem),
            kos: stats?.kothrownitem ?? 0,
        },
        ranked: ranked
            ? {
                  rating: ranked.rating,
                  peak_rating: ranked.peak_rating,
                  tier: ranked.tier,
                  wins: ranked.wins,
                  games: ranked.games,
                  rating_reset: legendRatingReset(ranked.rating),
              }
            : null,
    }
}

/**
 * The weapons roll-up, with each legend's contribution to it.
 *
 * `getWeaponsAccumulativeData` is the shared helper the old client used, so
 * this endpoint and the browser agree on what "weapon games" means by
 * construction rather than by two implementations that could drift.
 */
const toWeapons = (legends: readonly FullLegend[]): readonly PlayerWeapon[] =>
    getWeaponsAccumulativeData(getFullWeapons(legends)).map((weapon) => ({
        name: weapon.weapon,
        stats: {
            games: weapon.games,
            wins: weapon.wins,
            kos: weapon.kos,
            damage_dealt: weapon.damageDealt,
            time_held: weapon.matchtime,
            level: weapon.level,
            xp: weapon.xp,
        },
        /*
         * Each legend's own contribution, read from the slot that actually
         * holds this weapon. The aggregated block above sums the same numbers,
         * so the parts add up to the whole by construction rather than by two
         * formulas that happen to agree today.
         */
        legends: weapon.legends.map((legend) => {
            const isWeaponOne = legend.weapon_one === weapon.weapon

            return {
                id: legend.legend_id,
                name: legend.bio_name,
                slug: getEntitySlug(legend.legend_id, legend.bio_name),
                kos: isWeaponOne
                    ? (legend.stats?.koweaponone ?? 0)
                    : (legend.stats?.koweapontwo ?? 0),
                damage_dealt: isWeaponOne
                    ? int(legend.stats?.damageweaponone)
                    : int(legend.stats?.damageweapontwo),
                time_held: isWeaponOne
                    ? (legend.stats?.timeheldweaponone ?? 0)
                    : (legend.stats?.timeheldweapontwo ?? 0),
            }
        }),
    }))

/** One arrow function, so a 1v1 and a 3v3 record map through the same rules. */
type PlayerRankedBracket = NonNullable<
    NonNullable<PlayerEnvelope["data"]["ranked"]>["1v1"]
>

const toBracket = (input: {
    readonly rating: number
    readonly peak_rating: number
    readonly tier: string | null
    readonly wins: number
    readonly games: number
    readonly region: string | null
}): PlayerRankedBracket => ({
    rating: input.rating,
    peak_rating: input.peak_rating || input.rating,
    is_placement_matches: input.peak_rating === 0,
    // v1 reports the top of the ladder as a null tier; the renderer spells that
    // "Valhallan", and defaulting here keeps the two brackets consistent.
    tier: input.tier ?? "Valhallan",
    wins: input.wins,
    games: input.games,
    region: input.region,
    rating_reset: personalRatingReset(input.rating),
})

const to2v2Teams = (
    ranked: PlayerRanked,
): readonly PlayerRankedTeam[] => {
    return ranked["2v2"].map((team) => {
        const [one, two] = getTeamPlayers(team)

        return {
            team: [
                {
                    id: one.id,
                    name: one.name,
                    slug: getEntitySlug(one.id, one.name),
                },
                {
                    id: two.id,
                    name: two.name,
                    slug: getEntitySlug(two.id, two.name),
                },
            ],
            // A zero second id is v0 filing a solo queue in the team list. The
            // server knows the difference so every client does not have to.
            paired: two.id > 0,
            rating: team.rating,
            peak_rating: team.peak_rating,
            tier: team.tier,
            wins: team.wins,
            games: team.games,
            region: regionOf(rankedRegions[team.region - 1]),
            rating_reset: legendRatingReset(team.rating),
        }
    })
}

/** The ranked half of the profile, or `null` when there is no ranked data. */
const toRanked = (
    ranked: PlayerRanked | null,
    ranked3v3: Player3v3Ranked | null,
): PlayerEnvelope["data"]["ranked"] => {
    if (ranked === null && ranked3v3 === null) return null

    const teams = ranked?.["2v2"] ?? []
    const teamRows = ranked === null ? [] : to2v2Teams(ranked)

    // Averages divide by the number of teams, not by total games. Kubi divides
    // by games, which turns an elo into a per-game figure that reads as a
    // fraction of a rating; "average team elo" has to be per team to mean
    // anything.
    const average = (select: (row: PlayerRankedTeam) => number): number =>
        teamRows.length === 0
            ? 0
            : teamRows.reduce((sum, row) => sum + select(row), 0) /
              teamRows.length

    const bracket2v2 =
        teams.length === 0
            ? null
            : {
                  games: teams.reduce((sum, team) => sum + team.games, 0),
                  wins: teams.reduce((sum, team) => sum + team.wins, 0),
                  average_rating: average((row) => row.rating),
                  average_peak_rating: average((row) => row.peak_rating),
                  teams: teamRows,
              }

    const personal1v1 =
        ranked !== null && ranked.games > 0
            ? toBracket({
                  rating: ranked.rating,
                  peak_rating: ranked.peak_rating,
                  tier: ranked.tier,
                  wins: ranked.wins,
                  games: ranked.games,
                  region: regionOf(ranked.region),
              })
            : null

    const personal3v3 =
        ranked3v3 !== null && ranked3v3.games > 0
            ? toBracket({
                  rating: ranked3v3.rating,
                  peak_rating: ranked3v3.peak_rating,
                  tier: ranked3v3.tier,
                  wins: ranked3v3.wins,
                  games: ranked3v3.games,
                  region: regionOf(ranked3v3.region),
              })
            : null

    return {
        stats: seasonSummary({ ranked, ranked3v3 }),
        "1v1": personal1v1,
        "2v2": bracket2v2,
        "3v3": personal3v3,
    }
}

/** The clan card, enriched with the roster facts the membership read lacks. */
const toClan = (
    stats: PlayerStats,
    clan: Clan | null,
): PlayerEnvelope["data"]["clan"] => {
    const membership = stats.clan

    if (!membership) return null

    const member = clan?.clan.find(
        (row) => row.brawlhalla_id === stats.brawlhalla_id,
    )

    return {
        id: membership.clan_id,
        name: membership.clan_name,
        slug: getEntitySlug(membership.clan_id, membership.clan_name),
        xp: int(membership.clan_xp),
        personal_xp: membership.personal_xp,
        rank: member?.rank ?? null,
        joined_at: member?.join_date ?? null,
        // Both come from the guild read, which is the only source that knows
        // them: `/player/guild` carries the membership and nothing about the
        // guild itself.
        created_at: clan?.clan_create_date ?? null,
        members_count: clan?.clan.length ?? null,
    }
}

export type PlayerSources = {
    readonly stats: PlayerStats
    readonly ranked: PlayerRanked | null
    readonly ranked3v3: Player3v3Ranked | null
    /** The archive's alias list for this player, oldest first. */
    readonly aliases: readonly string[]
    /** The guild read, when the player has a clan we could look up. */
    readonly clan: Clan | null
}

export const buildPlayer = (
    sources: PlayerSources,
    updatedAt: number,
): PlayerEnvelope => {
    const { stats, ranked, ranked3v3, clan } = sources

    const legends = getFullLegends(stats.legends, ranked?.legends)
    const totals = getLegendsAccumulativeData(legends)
    const weaponless = getWeaponlessData(legends)
    const weapons = toWeapons(legends)

    /*
     * v1 has no thrown-item KO counter at all, so the volume is derived from
     * what is left of `kos` once the four sources it does report — either
     * wielded weapon, unarmed, and gadgets — are subtracted. Team KOs are
     * removed too: they are counted in `kos` but are not landed by this player,
     * so leaving them in would attribute them to a throw.
     *
     * A Brawlhalla KO has exactly those five sources, which is what makes the
     * remainder sound rather than a guess. The same derivation the profile
     * client used is done once here.
     */
    const weaponKos = legends.reduce(
        (sum, legend) =>
            sum +
            (legend.stats?.koweaponone ?? 0) +
            (legend.stats?.koweapontwo ?? 0),
        0,
    )

    const thrownKos = Math.max(
        0,
        totals.kos -
            weaponKos -
            weaponless.unarmed.kos -
            weaponless.gadgets.kos -
            totals.teamkos,
    )

    const weaponDamage = legends.reduce(
        (sum, legend) =>
            sum +
            int(legend.stats?.damageweaponone) +
            int(legend.stats?.damageweapontwo),
        0,
    )

    const player: PlayerEnvelope["data"] = {
        id: stats.brawlhalla_id,
        name: stats.name,
        slug: getEntitySlug(stats.brawlhalla_id, stats.name),
        aliases: aliasList(sources.aliases, stats.name),
        stats: {
            xp: stats.xp,
            level: stats.level,
            xp_percentage: stats.level === 100 ? 100 : stats.xp_percentage,
            games: stats.games,
            wins: stats.wins,
            matchtime: totals.matchtime,
            kos: totals.kos,
            falls: totals.falls,
            suicides: totals.suicides,
            team_kos: totals.teamkos,
            damage_dealt: totals.damagedealt,
            damage_taken: totals.damagetaken,
        },
        ranked: toRanked(ranked, ranked3v3),
        clan: toClan(stats, clan),
        unarmed: {
            damage_dealt: weaponless.unarmed.damageDealt,
            kos: weaponless.unarmed.kos,
            time_held: weaponless.unarmed.matchtime,
        },
        weapon_throws: {
            damage_dealt: weaponless.throws.damageDealt,
            kos: weaponless.throws.kos,
        },
        gadgets: {
            kos: weaponless.gadgets.kos,
            damage_dealt: weaponless.gadgets.damageDealt,
            bomb: {
                damage_dealt: int(stats.damagebomb),
                kos: stats.kobomb,
            },
            mine: {
                damage_dealt: int(stats.damagemine),
                kos: stats.komine,
            },
            spikeball: {
                damage_dealt: int(stats.damagespikeball),
                kos: stats.kospikeball,
            },
            sidekick: {
                damage_dealt: int(stats.damagesidekick),
                kos: stats.kosidekick,
            },
            snowball: {
                hits: stats.hitsnowball,
                kos: stats.kosnowball,
            },
        },
        // Only weapons actually held, most-held first. The roll-up is built
        // from the whole legend roster, which includes legends the player has
        // never touched, so without this filter a fresh account would ship
        // every weapon in the game at zero and the weapons tab would render
        // fifteen empty rows instead of its "no weapon usage" state.
        weapons: weapons
            .filter((weapon) => weapon.stats.games > 0)
            .sort((a, b) => b.stats.time_held - a.stats.time_held),
        legends: [...legends.map(toLegend)].sort(
            (a, b) => b.stats.xp - a.stats.xp,
        ),
        weapon_kos: weaponKos,
        thrown_kos: thrownKos,
        weapon_damage: weaponDamage,
    }

    return { data: player, meta: { updated_at: updatedAt } }
}
