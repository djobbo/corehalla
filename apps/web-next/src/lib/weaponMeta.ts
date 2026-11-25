import { weapons } from "@crh/bhapi/constants"
import type { Weapon } from "@crh/bhapi/constants"
import type { WeaponMeta, WeaponMetaRow } from "@crh/api-contract/schemas"
import type { SortDirection, SortOption } from "./useSortBy"

export type { WeaponMeta, WeaponMetaRow } from "@crh/api-contract/schemas"

export type WeaponMetaRank = {
    readonly position: number
    readonly total: number
}

export type WeaponMetaMetric =
    | "playShare"
    | "winRate"
    | "games"
    | "accounts"
    | "damagePerGame"
    | "timeHeldPerGame"

const weaponMetaMetricName: Record<WeaponMetaMetric, string> = {
    playShare: "play share",
    winRate: "win rate",
    games: "games",
    accounts: "accounts",
    damagePerGame: "damage per game",
    timeHeldPerGame: "time held per game",
}

/** Locale pinned: the card is server-rendered, so both sides must agree. */
export const formatWeaponMetaCount = (value: number | null): string =>
    value === null ? "—" : Math.round(value).toLocaleString("en-US")

/** Per-game averages keep one decimal: rounding them to whole numbers hides the spread. */
export const weaponMetaAverage = (value: number | null): string =>
    value === null
        ? "—"
        : value.toLocaleString("en-US", {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
          })

/** Fractions of one; at most two decimals of a percent, without trailing zeros. */
export const formatWeaponMetaRate = (value: number | null): string =>
    value === null ? "—" : `${(value * 100).toFixed(2).replace(/\.?0+$/, "")}%`

/** Whole seconds under a minute, then minutes, then hours. */
export const formatWeaponMetaDuration = (value: number | null): string => {
    if (value === null) return "—"

    const seconds = Math.round(value)

    if (seconds < 60) return `${seconds}s`

    const minutes = Math.floor(seconds / 60)

    if (minutes < 60) {
        const rest = seconds % 60

        return rest === 0 ? `${minutes}m` : `${minutes}m ${rest}s`
    }

    const hours = Math.floor(minutes / 60)
    const rest = minutes % 60

    return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`
}

export type WeaponMetaSort =
    | "playShare"
    | "winRate"
    | "damagePerGame"
    | "timeHeldPerGame"
    | "kosPerGame"

/** Play share answers the question a visitor opens the page with. */
export const weaponMetaDefaultSort: WeaponMetaSort = "playShare"
export const weaponMetaDefaultDirection: SortDirection = "desc"

export type WeaponMetaTableRow = {
    readonly weapon: Weapon
    readonly meta: WeaponMetaRow | null
}

/** Every weapon, so a weapon the sample skipped still links to its page. */
export const weaponMetaTableRows = (
    sample: WeaponMeta,
): readonly WeaponMetaTableRow[] => {
    const byWeapon = new Map(sample.data.map((entry) => [entry.weapon, entry]))

    return weapons.map((weapon) => ({
        weapon,
        meta: byWeapon.get(weapon) ?? null,
    }))
}

type WeaponMetric = (row: WeaponMetaRow | null) => number | null

/** Ascending: `useSortBy` applies the direction, a missing metric always sorts last. */
const metric = (
    label: string,
    pick: WeaponMetric,
): SortOption<WeaponMetaTableRow> => ({
    label,
    compare: (left, right) => (pick(left.meta) ?? 0) - (pick(right.meta) ?? 0),
    isMissing: (row) => pick(row.meta) === null,
})

export const weaponMetaSorts: Record<
    WeaponMetaSort,
    SortOption<WeaponMetaTableRow>
> = {
    playShare: metric("Play share", (row) => row?.playShare ?? null),
    winRate: metric("Win rate", (row) => row?.winRate ?? null),
    damagePerGame: metric(
        "Damage per game",
        (row) => row?.damagePerGame ?? null,
    ),
    timeHeldPerGame: metric(
        "Time held per game",
        (row) => row?.timeHeldPerGame ?? null,
    ),
    kosPerGame: metric("KOs per game", (row) => row?.kosPerGame ?? null),
}

export const weaponMetaRankLabel = (
    { position, total }: WeaponMetaRank,
    metric: WeaponMetaMetric,
): string => `#${position} of ${total} by ${weaponMetaMetricName[metric]}`

/**
 * Ties share a position: the rank counts the weapons strictly ahead, and the
 * sample is every weapon that reports the metric at all.
 */
export const weaponMetaRank = (
    rows: readonly WeaponMetaRow[],
    weapon: WeaponMetaRow["weapon"],
    metric: WeaponMetaMetric,
): WeaponMetaRank | null => {
    const row = rows.find((entry) => entry.weapon === weapon)

    if (row === undefined) return null

    const value = row[metric]

    if (value === null) return null

    const reported = rows
        .map((entry) => entry[metric])
        .filter((entry): entry is number => entry !== null)

    return {
        position: 1 + reported.filter((entry) => entry > value).length,
        total: reported.length,
    }
}
