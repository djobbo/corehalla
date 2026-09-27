import { useMemo } from "react"
import { playerRankedAtom, playerStatsAtom, useQuery } from "@/effect/atoms"
import { isPairedTeam } from "@/lib/rankings"
import {
    getFullLegends,
    getFullWeapons,
    getLegendsAccumulativeData,
    getWeaponlessData,
    getWeaponsAccumulativeData,
} from "@crh/bhapi/legends"
import type { FullLegend } from "@crh/bhapi/legends"
import type { PlayerRanked, PlayerStats } from "@crh/bhapi/types"

/** One row of `getWeaponsAccumulativeData`. */
export type WeaponTotals = ReturnType<typeof getWeaponsAccumulativeData>[number]

export type PlayerDerived = {
    readonly stats: PlayerStats
    readonly ranked: PlayerRanked | null
    /** Every legend in the roster, played or not. */
    readonly legends: readonly FullLegend[]
    /** Totals across every legend — the profile's career figures. */
    readonly totals: ReturnType<typeof getLegendsAccumulativeData>
    /** Unarmed / throw / gadget totals, which no legend row owns. */
    readonly weaponless: ReturnType<typeof getWeaponlessData>
    /**
     * KOs landed with a wielded weapon, summed from the two weapon counters.
     *
     * Taken explicitly rather than as "whatever is left of `kos`", because v1
     * does not report thrown-item KOs at all. A remainder would quietly fold
     * those into weapons and overstate them.
     */
    readonly weaponKos: number
    /**
     * Thrown-item KOs — derived, never reported.
     *
     * v1 has no thrown-item KO counter, so this is what `kos` counts that the
     * other sources do not. The inference is sound rather than a guess: a
     * Brawlhalla KO has exactly five possible sources — either wielded weapon,
     * unarmed, a gadget, or a thrown item — and v1 reports the other four. What
     * is left over can only be the fifth.
     *
     * (`getWeaponlessData().throws.kos` reads the v0 field for this and is
     * therefore always 0 against v1 data; this is the number that replaces it.)
     */
    readonly thrownKos: number
    /**
     * Damage dealt with a wielded weapon, summed from the two weapon counters.
     *
     * Unlike `weaponKos` this is a convenience sum rather than a recovery:
     * every damage source *is* reported, thrown items included. They still do
     * not quite add up to `damage_dealt` — self-inflicted damage has no counter
     * of its own — which is a shortfall the bars show rather than hide.
     */
    readonly weaponDamage: number
    /**
     * The legends this player has spent the most time on, most-played first.
     *
     * Ordered by time played rather than by level: a legend can reach a high
     * level off a handful of long games, but "main" means where the hours went.
     */
    readonly topLegends: readonly FullLegend[]
    /** Weapons actually held, most-held first. */
    readonly weapons: readonly WeaponTotals[]
    /** The weapons held longest — the header's art row. */
    readonly topWeapons: readonly WeaponTotals[]
    readonly has2v2: boolean
}

/** How many art tiles the profile header shows in each of its rows. */
const TOP_ART_COUNT = 3

/**
 * The player's two API payloads, resolved into the shapes the page actually
 * renders.
 *
 * The header, the overview, and each tab all need the same three things — the
 * full legend roster, the career totals, and the weapon roll-up — and all three
 * are pure functions of the same two atoms. Deriving them once here is what
 * keeps "what a player's data means" a single decision, so the header and the
 * overview cannot disagree about, say, which legend is the main one.
 *
 * Returns `null` only while the player genuinely does not exist; every consumer
 * renders its own empty state from that.
 */
export const usePlayerDerived = (playerId: number): PlayerDerived | null => {
    const stats = useQuery(playerStatsAtom(playerId))
    const ranked = useQuery(playerRankedAtom(playerId))

    return useMemo(() => {
        if (!stats) return null

        /*
         * `PlayerRankedSchema` is a JSON passthrough, so the decoded value is
         * trusted to match `PlayerRanked` rather than validated against it — and
         * the shared helpers read `ranked["2v2"]` and `ranked.legends` without a
         * guard (`getGlory` indexes straight into both). Normalising once, here,
         * is what keeps every consumer from having to re-derive the same caution.
         */
        const safeRanked = ranked
            ? {
                  ...ranked,
                  "2v2": ranked["2v2"] ?? [],
                  legends: ranked.legends ?? [],
              }
            : null

        const legends = getFullLegends(stats.legends, safeRanked?.legends)
        const totals = getLegendsAccumulativeData(legends)

        const weapons = getWeaponsAccumulativeData(getFullWeapons(legends))
            .filter((weapon) => weapon.games > 0)
            .sort((a, b) => b.matchtime - a.matchtime)

        const topLegends = legends
            .filter((legend) => (legend.stats?.games ?? 0) > 0)
            .sort(
                (a, b) =>
                    (b.stats?.matchtime ?? 0) - (a.stats?.matchtime ?? 0),
            )
            .slice(0, TOP_ART_COUNT)

        const weaponKos = legends.reduce(
            (sum, legend) =>
                sum +
                (legend.stats?.koweaponone ?? 0) +
                (legend.stats?.koweapontwo ?? 0),
            0,
        )

        const weaponless = getWeaponlessData(legends)

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
                Number(legend.stats?.damageweaponone ?? 0) +
                Number(legend.stats?.damageweapontwo ?? 0),
            0,
        )

        return {
            stats,
            ranked: safeRanked,
            legends,
            totals,
            weaponless,
            weaponKos,
            thrownKos,
            weaponDamage,
            topLegends,
            weapons,
            topWeapons: weapons.slice(0, TOP_ART_COUNT),
            has2v2: safeRanked !== null && safeRanked["2v2"].some(isPairedTeam),
        }
    }, [stats, ranked])
}
