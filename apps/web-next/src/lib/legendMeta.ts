import { weapons } from "@crh/bhapi/constants"
import { legendsMap } from "@crh/bhapi/legends"
import { formatMetaCount } from "./metaFloor"
import { resolveWeaponSlug, weaponSlug } from "./weapons"
import type { Weapon } from "@crh/bhapi/constants"
import type { LegendMetaRow, MetaFloor } from "@crh/api-contract/schemas"
import type { SortDirection, SortOption } from "./useSortBy"

export type { LegendMetaRow } from "@crh/api-contract/schemas"

export type LegendMetaSort =
    | "playShare"
    | "winRate"
    | "damageDealtPerGame"
    | "averageMatchSeconds"
    | "suicidesPer100Games"
    | "games"

export type LegendMetaMetric = LegendMetaSort | "accounts"

export type LegendMetaRank = {
    readonly position: number
    readonly total: number
}

/** Fractions of one; at most two decimals of a percent, without trailing zeros. */
export const formatLegendMetaRate = (value: number): string =>
    `${(value * 100).toFixed(2).replace(/\.?0+$/, "")}%`

const ascending =
    (pick: (row: LegendMetaRow) => number) =>
    (left: LegendMetaRow, right: LegendMetaRow): number =>
        pick(left) - pick(right)

/** Ascending; a metric the sample cannot answer sorts behind every row that answers it. */
const playStyleMetric = (
    label: string,
    pick: (row: LegendMetaRow) => number | null,
): SortOption<LegendMetaRow> => ({
    label,
    compare: (left, right) => (pick(left) ?? 0) - (pick(right) ?? 0),
    isMissing: (row) => pick(row) === null,
})

/** Play share answers the question a visitor opens the board with. */
export const legendMetaDefaultSort: LegendMetaSort = "playShare"
export const legendMetaDefaultDirection: SortDirection = "desc"

/** Ascending comparators: `useSortBy` applies the direction. */
export const legendMetaSorts: Record<
    LegendMetaSort,
    SortOption<LegendMetaRow>
> = {
    playShare: {
        label: "Play share",
        compare: ascending((row) => row.playShare),
    },
    winRate: { label: "Win rate", compare: ascending((row) => row.winRate) },
    damageDealtPerGame: playStyleMetric(
        "Damage dealt per game",
        (row) => row.playStyle.damageDealtPerGame,
    ),
    averageMatchSeconds: playStyleMetric(
        "Match length",
        (row) => row.playStyle.averageMatchSeconds,
    ),
    suicidesPer100Games: playStyleMetric(
        "Suicides per 100 games",
        (row) => row.playStyle.suicidesPer100Games,
    ),
    games: { label: "Games", compare: ascending((row) => row.games) },
}

const legendMetaMetricValue = (
    row: LegendMetaRow,
    metric: LegendMetaMetric,
): number | null =>
    metric === "damageDealtPerGame" ||
    metric === "averageMatchSeconds" ||
    metric === "suicidesPer100Games"
        ? row.playStyle[metric]
        : row[metric]

/**
 * Ties share a position: the rank counts the legends strictly ahead, and the
 * sample is every legend that reports the metric at all.
 */
export const legendMetaRank = (
    rows: readonly LegendMetaRow[],
    legendId: LegendMetaRow["legendId"],
    metric: LegendMetaMetric,
): LegendMetaRank | null => {
    const row = rows.find((entry) => entry.legendId === legendId)

    if (row === undefined) return null

    const value = legendMetaMetricValue(row, metric)

    if (value === null) return null

    const reported = rows
        .map((entry) => legendMetaMetricValue(entry, metric))
        .filter((entry): entry is number => entry !== null)

    return {
        position: 1 + reported.filter((entry) => entry > value).length,
        total: reported.length,
    }
}

export const legendMetaRankLabel = ({
    position,
    total,
}: LegendMetaRank): string => `#${position} of ${total}`

/** A weapon a visitor can narrow the board to, or the whole roster. */
export type LegendMetaWeapon = "all" | Weapon

export const legendMetaWeaponOptions: readonly {
    readonly value: LegendMetaWeapon
    readonly label: string
}[] = [
    { value: "all", label: "All weapons" },
    ...weapons.map((weapon) => ({ value: weapon, label: weapon })),
]

/** The URL carries the slug the weapon pages use; anything else is All. */
export const resolveLegendMetaWeapon = (value: unknown): LegendMetaWeapon =>
    typeof value === "string" ? (resolveWeaponSlug(value) ?? "all") : "all"

export const legendMetaWeaponSearch = (
    weapon: LegendMetaWeapon,
): { weapon?: string } =>
    weapon === "all" ? {} : { weapon: weaponSlug(weapon) }

/**
 * Either slot counts. All returns the input untouched, so the board keeps the
 * order the sort left it in.
 */
export const filterLegendMetaByWeapon = (
    rows: readonly LegendMetaRow[],
    weapon: LegendMetaWeapon,
): readonly LegendMetaRow[] => {
    if (weapon === "all") return rows

    return rows.filter((row) => {
        const legend = legendsMap[row.legendId]

        return (
            legend !== undefined &&
            (legend.weapon_one === weapon || legend.weapon_two === weapon)
        )
    })
}

/** How much of the unfiltered board the chosen weapon keeps. */
export const legendMetaWeaponSample = (
    shown: number,
    total: number,
    weapon: LegendMetaWeapon,
): string | null =>
    weapon === "all"
        ? null
        : `${formatMetaCount(shown)} of ${formatMetaCount(total)} legends wield ${weapon}`

export const legendMetaWeaponEmpty = (
    weapon: Weapon,
    floor: MetaFloor,
): string =>
    floor === "all"
        ? `No legend wielding ${weapon} has indexed games yet.`
        : `No legend wielding ${weapon} has indexed games at ${floor}+ rating yet.`
