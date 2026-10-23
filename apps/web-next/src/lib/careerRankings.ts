import { formatTime } from "@crh/common/helpers/date"
import type {
    SortableLegendProp,
    SortablePlayerProp,
    SortableWeaponProp,
} from "@crh/api-contract/schemas"

export type CareerSortOption<K extends string> = {
    readonly value: K
    readonly label: string
    readonly format: (value: number) => string
}

export type CareerBoard<K extends string> = {
    readonly sorts: readonly CareerSortOption<K>[]
    readonly defaultSort: K
    readonly sort: (value: unknown) => K
    readonly option: (value: K) => CareerSortOption<K>
}

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
