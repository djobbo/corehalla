import { formatTime } from "@crh/common/helpers/date"
import type {
    SortableLegendProp,
    SortablePlayerProp,
    SortableWeaponProp,
} from "@crh/api-contract/schemas"

/**
 * What each stat leaderboard can be ordered by.
 *
 * Three boards share one shape — a player, one number — and differ only in
 * which columns they may sort by and what those columns mean. Keeping the
 * options here rather than in each page is what stops a board offering a sort
 * its endpoint would reject: the arrays are typed against the contract's own
 * literals, so a mismatch is a compile error rather than a 500.
 */

export type CareerSortOption<K extends string> = {
    readonly value: K
    readonly label: string
    /** Renders the sorted figure. Its column header is `label`. */
    readonly format: (value: number) => string
}

export type CareerBoard<K extends string> = {
    readonly sorts: readonly CareerSortOption<K>[]
    readonly defaultSort: K
    /** Coerces a URL value to a sort this board accepts, defaulting. */
    readonly sort: (value: unknown) => K
    /** The descriptor for a sort key. Total, because `sort` guarantees one. */
    readonly option: (value: K) => CareerSortOption<K>
}

/**
 * Builds a board from its default and the rest of its options.
 *
 * The default is passed as the whole descriptor rather than as a key, which is
 * what lets the fallback be returned without a lookup that the type system
 * cannot prove succeeded. Taking a key would mean either asserting that the
 * list contains it or handling an impossible `undefined` at every call site.
 */
const board = <K extends string>(
    fallback: CareerSortOption<K>,
    others: readonly CareerSortOption<K>[],
): CareerBoard<K> => {
    const sorts = [fallback, ...others]
    const byValue = new Map<string, CareerSortOption<K>>(
        sorts.map((entry) => [entry.value, entry]),
    )

    return {
        sorts,
        defaultSort: fallback.value,
        sort: (value) =>
            byValue.has(String(value)) ? (String(value) as K) : fallback.value,
        option: (value) => byValue.get(value) ?? fallback,
    }
}

const count = (value: number): string => value.toLocaleString()

/** Career totals across every legend and weapon. */
export const playerBoard = board<SortablePlayerProp>(
    { value: "xp", label: "Account XP", format: count },
    [
        { value: "games", label: "Games", format: count },
        { value: "wins", label: "Wins", format: count },
        { value: "rankedGames", label: "Ranked games", format: count },
        { value: "rankedWins", label: "Ranked wins", format: count },
        { value: "kos", label: "KOs", format: count },
        { value: "falls", label: "Falls", format: count },
        { value: "suicides", label: "Suicides", format: count },
        { value: "teamKos", label: "Team KOs", format: count },
        { value: "damageDealt", label: "Damage dealt", format: count },
        { value: "damageTaken", label: "Damage taken", format: count },
        { value: "matchTime", label: "Match time", format: formatTime },
        { value: "damageUnarmed", label: "Unarmed damage", format: count },
        { value: "koUnarmed", label: "Unarmed KOs", format: count },
        {
            value: "matchTimeUnarmed",
            label: "Unarmed match time",
            format: formatTime,
        },
        {
            value: "koThrownItem",
            label: "Thrown-item KOs",
            format: count,
        },
        {
            value: "damageThrownItem",
            label: "Thrown-item damage",
            format: count,
        },
        { value: "koGadgets", label: "Gadget KOs", format: count },
        { value: "damageGadgets", label: "Gadget damage", format: count },
    ],
)

/** Totals with a single legend, which is what the row's number means. */
export const legendBoard = board<SortableLegendProp>(
    { value: "games", label: "Games", format: count },
    [
        { value: "wins", label: "Wins", format: count },
        { value: "kos", label: "KOs", format: count },
        { value: "falls", label: "Falls", format: count },
        { value: "suicides", label: "Suicides", format: count },
        { value: "teamKos", label: "Team KOs", format: count },
        { value: "damageDealt", label: "Damage dealt", format: count },
        { value: "damageTaken", label: "Damage taken", format: count },
        { value: "matchTime", label: "Match time", format: formatTime },
        {
            value: "timeHeldWeaponOne",
            label: "Time holding weapon one",
            format: formatTime,
        },
        {
            value: "timeHeldWeaponTwo",
            label: "Time holding weapon two",
            format: formatTime,
        },
        { value: "xp", label: "Legend XP", format: count },
        { value: "level", label: "Legend level", format: count },
    ],
)

/**
 * Totals with a single weapon.
 *
 * Only the columns `BHPlayerWeapon` actually stores. A board cannot offer, say,
 * "damage taken with Sword", because the ingest does not record it — and
 * offering it would mean either an empty column or a sum over the legend rows
 * this table exists to avoid.
 */
export const weaponBoard = board<SortableWeaponProp>(
    { value: "kos", label: "KOs", format: count },
    [
        { value: "games", label: "Games", format: count },
        { value: "wins", label: "Wins", format: count },
        { value: "damageDealt", label: "Damage dealt", format: count },
        { value: "matchTime", label: "Time held", format: formatTime },
        { value: "xp", label: "Weapon XP", format: count },
        { value: "level", label: "Weapon level", format: count },
    ],
)
