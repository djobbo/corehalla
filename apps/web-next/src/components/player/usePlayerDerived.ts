import { useMemo } from "react"
import { playerProfileAtom, useQuery } from "@/effect/atoms"
import type { FullLegend } from "@crh/bhapi/legends"
import type { getWeaponsAccumulativeData } from "@crh/bhapi/legends"
import type { Weapon } from "@crh/bhapi/constants"
import type { RankedTier } from "@crh/bhapi/constants"
import type { Player } from "@crh/api-contract/schemas"

/**
 * The player profile, resolved for the components that render it.
 *
 * This used to be where the client did the work: read four atoms, build the
 * full legend roster, sum the career totals, roll the weapons up and derive the
 * thrown-item KOs. All of that is now computed once, server-side, by
 * `apps/api/src/aggregate/player.ts`, and arrives in the single
 * `playerProfileAtom`.
 *
 * What is left is translation, and it is deliberately the only place the two
 * vocabularies meet. The API speaks `kubi`'s `snake_case` product shape; the
 * presentational components speak the shape the old raw payloads had
 * (`FullLegend`, `WeaponStats`, the accumulator key names). Keeping that
 * mapping in one hook means a component never has to know both.
 */

/** One row of `getWeaponsAccumulativeData` — a weapon plus its totals. */
export type WeaponStats = ReturnType<typeof getWeaponsAccumulativeData>[number]

/** The career accumulator shape the header and overview read. */
export type PlayerTotals = {
    readonly matchtime: number
    readonly kos: number
    readonly falls: number
    readonly suicides: number
    readonly teamkos: number
    readonly damagedealt: number
    readonly damagetaken: number
}

/** Unarmed / throw / gadget totals, which no legend row owns. */
export type WeaponlessTotals = {
    readonly unarmed: {
        readonly kos: number
        readonly damageDealt: number
        readonly matchtime: number
    }
    readonly gadgets: { readonly kos: number; readonly damageDealt: number }
    readonly throws: { readonly kos: number; readonly damageDealt: number }
}

/**
 * The account facts the header renders.
 *
 * A subset of the aggregate's `stats` plus its `clan` card, under the names the
 * header already used — so the header did not have to change to read the new
 * payload. `clan_xp` stays a string because that is what the contribution
 * percentage is computed from and what a caller might print verbatim.
 */
export type PlayerAccount = {
    readonly name: string
    readonly brawlhalla_id: number
    readonly level: number
    readonly xp: number
    readonly games: number
    readonly wins: number
    readonly clan: {
        readonly clan_id: number
        readonly clan_name: string
        readonly clan_xp: string
        readonly personal_xp: number
    } | null
}

export type PlayerDerived = {
    /** The payload as the API sends it. Components that read product fields use this. */
    readonly profile: Player
    readonly stats: PlayerAccount
    /** Every legend in the roster, in the view shape the legends tab renders. */
    readonly legends: readonly FullLegend[]
    /** Weapons actually held, most-held first. */
    readonly weapons: readonly WeaponStats[]
    readonly totals: PlayerTotals
    readonly weaponless: WeaponlessTotals
    /**
     * KOs landed with a wielded weapon and with a thrown item.
     *
     * Both are precomputed server-side: v1 has no thrown-item KO counter, so
     * the server derives it from the remainder — see `aggregate/player.ts` —
     * and the client no longer has to know that rule to draw an honest bar.
     */
    readonly weaponKos: number
    readonly thrownKos: number
    readonly weaponDamage: number
    /** The legends this player has spent the most time on, most-played first. */
    readonly topLegends: readonly FullLegend[]
    /** The weapons held longest — the header's art row. */
    readonly topWeapons: readonly WeaponStats[]
    readonly has2v2: boolean
}

/** How many art tiles the profile header shows in each of its rows. */
const TOP_ART_COUNT = 3

/** The number a v1 payload spells as a string, or `0` when it is absent. */
const int = (value: number): string => String(value)

/**
 * One API legend as the `FullLegend` the legends tab renders.
 *
 * The local legend table's biography and base stat lines are not carried by the
 * API, and nothing renders them any more — the tab draws the account's own
 * numbers — so they are placeholders rather than a second copy of the table on
 * the server.
 */
const toFullLegend = (legend: Player["legends"][number]): FullLegend => ({
    legend_id: legend.id,
    legend_name_key: legend.name_key,
    bio_name: legend.name,
    bio_aka: "",
    weapon_one: legend.weapon_one.name as Weapon,
    weapon_two: legend.weapon_two.name as Weapon,
    strength: "0",
    dexterity: "0",
    defense: "0",
    speed: "0",
    stats: {
        legend_id: legend.id,
        legend_name_key: legend.name_key,
        damagedealt: int(legend.stats.damage_dealt),
        damagetaken: int(legend.stats.damage_taken),
        kos: legend.stats.kos,
        falls: legend.stats.falls,
        suicides: legend.stats.suicides,
        teamkos: legend.stats.team_kos,
        matchtime: legend.stats.matchtime,
        games: legend.stats.games,
        wins: legend.stats.wins,
        damageunarmed: int(legend.unarmed.damage_dealt),
        damagethrownitem: int(legend.weapon_throws.damage_dealt),
        damageweaponone: int(legend.weapon_one.damage_dealt),
        damageweapontwo: int(legend.weapon_two.damage_dealt),
        damagegadgets: int(legend.gadgets.damage_dealt),
        kounarmed: legend.unarmed.kos,
        kothrownitem: legend.weapon_throws.kos,
        koweaponone: legend.weapon_one.kos,
        koweapontwo: legend.weapon_two.kos,
        kogadgets: legend.gadgets.kos,
        timeheldweaponone: legend.weapon_one.time_held,
        timeheldweapontwo: legend.weapon_two.time_held,
        xp: legend.stats.xp,
        level: legend.stats.level,
        xp_percentage: legend.stats.xp_percentage,
    },
    ranked: legend.ranked
        ? {
              legend_id: legend.id,
              legend_name_key: legend.name_key,
              rating: legend.ranked.rating,
              peak_rating: legend.ranked.peak_rating,
              tier: legend.ranked.tier as RankedTier | null,
              wins: legend.ranked.wins,
              games: legend.ranked.games,
          }
        : undefined,
})

const toWeaponStats = (
    profile: Player,
    legends: readonly FullLegend[],
): readonly WeaponStats[] => {
    const byId = new Map(legends.map((legend) => [legend.legend_id, legend]))

    return profile.weapons.map((weapon) => ({
        weapon: weapon.name,
        // Joining back to the full legend keeps `WeaponRow`'s ranked summary
        // working unchanged: the API sends each legend's contribution to the
        // weapon, and the legend object supplies the ranked record beside it.
        legends: weapon.legends.flatMap((legend) => {
            const full = byId.get(legend.id)

            return full ? [full] : []
        }),
        games: weapon.stats.games,
        wins: weapon.stats.wins,
        kos: weapon.stats.kos,
        damageDealt: weapon.stats.damage_dealt,
        matchtime: weapon.stats.time_held,
        level: weapon.stats.level,
        xp: weapon.stats.xp,
    }))
}

export const usePlayerDerived = (playerId: number): PlayerDerived | null => {
    const envelope = useQuery(playerProfileAtom(playerId))

    return useMemo(() => {
        const profile = envelope.data

        const legends = profile.legends.map(toFullLegend)
        const weapons = toWeaponStats(profile, legends)

        const topLegends = legends
            .filter((legend) => (legend.stats?.games ?? 0) > 0)
            .slice(0)
            .sort(
                (a, b) =>
                    (b.stats?.matchtime ?? 0) - (a.stats?.matchtime ?? 0),
            )
            .slice(0, TOP_ART_COUNT)

        return {
            profile,
            stats: {
                name: profile.name,
                brawlhalla_id: profile.id,
                level: profile.stats.level,
                xp: profile.stats.xp,
                games: profile.stats.games,
                wins: profile.stats.wins,
                clan: profile.clan
                    ? {
                          clan_id: profile.clan.id,
                          clan_name: profile.clan.name,
                          clan_xp: String(profile.clan.xp),
                          personal_xp: profile.clan.personal_xp,
                      }
                    : null,
            },
            legends,
            weapons,
            totals: {
                matchtime: profile.stats.matchtime,
                kos: profile.stats.kos,
                falls: profile.stats.falls,
                suicides: profile.stats.suicides,
                teamkos: profile.stats.team_kos,
                damagedealt: profile.stats.damage_dealt,
                damagetaken: profile.stats.damage_taken,
            },
            weaponless: {
                unarmed: {
                    kos: profile.unarmed.kos,
                    damageDealt: profile.unarmed.damage_dealt,
                    matchtime: profile.unarmed.time_held,
                },
                gadgets: {
                    kos: profile.gadgets.kos,
                    damageDealt: profile.gadgets.damage_dealt,
                },
                throws: {
                    kos: profile.weapon_throws.kos,
                    damageDealt: profile.weapon_throws.damage_dealt,
                },
            },
            weaponKos: profile.weapon_kos,
            thrownKos: profile.thrown_kos,
            weaponDamage: profile.weapon_damage,
            topLegends,
            topWeapons: weapons.slice(0, TOP_ART_COUNT),
            has2v2:
        profile.ranked?.["2v2"]?.teams.some((team) => team.paired) ?? false,
        }
    }, [envelope])
}
