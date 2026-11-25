import { legendMetaFloors } from "@crh/api-contract/schemas"
import type { LegendMetaFloor, LegendMetaRow } from "@crh/api-contract/schemas"
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

/** Locale pinned: the board is server-rendered, so both sides must agree. */
export const formatLegendMetaCount = (value: number): string =>
    value.toLocaleString("en-US")

export const legendMetaFloorLabel = (floor: LegendMetaFloor): string =>
    floor === "all" ? "All" : `${floor}+`

export const legendMetaSample = (
    accounts: number,
    floor: LegendMetaFloor,
): string =>
    `Across ${formatLegendMetaCount(accounts)} indexed accounts${
        floor === "all" ? "" : ` at ${floor}+ rating`
    }`

export const legendMetaEmpty = (floor: LegendMetaFloor): string =>
    floor === "all"
        ? "No legend games are indexed yet."
        : `No legend games are indexed at ${floor}+ rating yet.`

/** The sample is Corehalla's index, never the official ladder. */
export const legendMetaDisclaimer =
    "aggregated from Corehalla's index, not official Brawlhalla figures."

/** Fractions of one; at most two decimals of a percent, without trailing zeros. */
export const formatLegendMetaRate = (value: number): string =>
    `${(value * 100).toFixed(2).replace(/\.?0+$/, "")}%`

export const isLegendMetaFloor = (value: unknown): value is LegendMetaFloor =>
    (legendMetaFloors as readonly unknown[]).includes(value)

export const resolveLegendMetaFloor = (value: unknown): LegendMetaFloor =>
    isLegendMetaFloor(value) ? value : "all"

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
