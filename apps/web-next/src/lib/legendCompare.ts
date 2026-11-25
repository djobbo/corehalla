import {
    formatLegendMetaCount,
    formatLegendMetaRate,
    legendMetaDisclaimer,
} from "./legendMeta"
import {
    formatPlayStyleMatchLength,
    formatPlayStylePerGame,
    playStyleUnknown,
} from "./legendPlayStyle"
import { legendAttributes } from "./legends"
import type { LegendMetaRow, LegendPlayStyle } from "@crh/api-contract/schemas"
import type { Legend } from "@crh/bhapi/types"

export type LegendCompareWinner = "a" | "b" | null

export type LegendCompareRow = {
    readonly label: string
    readonly a: string
    readonly b: string
    readonly winner: LegendCompareWinner
}

type Direction = "higher" | "lower"

type Side = {
    readonly legend: Legend
    readonly meta: LegendMetaRow | null
}

type Cell = {
    readonly text: string
    readonly measure: number | null
}

type Metric = {
    readonly label: string
    readonly direction?: Direction
    readonly cell: (side: Side) => Cell
}

const attribute = (
    label: string,
    key: keyof ReturnType<typeof legendAttributes>,
): Metric => ({
    label,
    cell: (side) => ({
        text: `${legendAttributes(side.legend)[key]} / 10`,
        measure: null,
    }),
})

const boardMetric = (
    label: string,
    pick: (row: LegendMetaRow) => number,
    format: (value: number) => string,
    direction?: Direction,
): Metric => ({
    label,
    direction,
    cell(side) {
        if (side.meta === null) return { text: playStyleUnknown, measure: null }

        const value = pick(side.meta)

        return { text: format(value), measure: value }
    },
})

const playStyleMetric = (
    label: string,
    pick: (playStyle: LegendPlayStyle) => number | null,
    format: (value: number) => string,
    direction?: Direction,
): Metric => ({
    label,
    direction,
    cell(side) {
        const value = side.meta === null ? null : pick(side.meta.playStyle)

        return value === null
            ? { text: playStyleUnknown, measure: null }
            : { text: format(value), measure: value }
    },
})

const weaponSplit = (side: Side): string => {
    const playStyle = side.meta?.playStyle

    if (
        playStyle === undefined ||
        playStyle.weaponOneShare === null ||
        playStyle.weaponTwoShare === null
    ) {
        return playStyleUnknown
    }

    return `${formatLegendMetaRate(playStyle.weaponOneShare)} ${side.legend.weapon_one} · ${formatLegendMetaRate(playStyle.weaponTwoShare)} ${side.legend.weapon_two}`
}

/** The sample the comparison reads: every indexed account, with no rating floor. */
export const legendCompareSample = (accounts: number): string =>
    `Across ${formatLegendMetaCount(accounts)} indexed accounts, all ratings · ${legendMetaDisclaimer}`

const metrics: readonly Metric[] = [
    attribute("Strength", "strength"),
    attribute("Dexterity", "dexterity"),
    attribute("Defense", "defense"),
    attribute("Speed", "speed"),
    boardMetric("Play share", (row) => row.playShare, formatLegendMetaRate),
    boardMetric(
        "Win rate",
        (row) => row.winRate,
        formatLegendMetaRate,
        "higher",
    ),
    boardMetric("Games", (row) => row.games, formatLegendMetaCount),
    boardMetric("Accounts", (row) => row.accounts, formatLegendMetaCount),
    playStyleMetric(
        "Damage dealt / game",
        (style) => style.damageDealtPerGame,
        formatPlayStylePerGame,
        "higher",
    ),
    playStyleMetric(
        "Damage taken / game",
        (style) => style.damageTakenPerGame,
        formatPlayStylePerGame,
        "lower",
    ),
    playStyleMetric(
        "KOs / game",
        (style) => style.kosPerGame,
        formatPlayStylePerGame,
        "higher",
    ),
    playStyleMetric(
        "Falls / game",
        (style) => style.fallsPerGame,
        formatPlayStylePerGame,
        "lower",
    ),
    playStyleMetric(
        "Suicides / 100 games",
        (style) => style.suicidesPer100Games,
        formatPlayStylePerGame,
        "lower",
    ),
    playStyleMetric(
        "Average match",
        (style) => style.averageMatchSeconds,
        formatPlayStyleMatchLength,
    ),
    {
        label: "Held weapon time",
        cell: (side) => ({ text: weaponSplit(side), measure: null }),
    },
]

/** A dash is unknown, so it never wins; only two known, unequal values can. */
const winnerOf = (
    a: Cell,
    b: Cell,
    direction: Direction | undefined,
): LegendCompareWinner => {
    if (
        direction === undefined ||
        a.measure === null ||
        b.measure === null ||
        a.measure === b.measure
    ) {
        return null
    }

    return (
        direction === "higher" ? a.measure > b.measure : a.measure < b.measure
    )
        ? "a"
        : "b"
}

export const compareLegends = (
    a: Legend,
    b: Legend,
    metaRows: readonly LegendMetaRow[],
): readonly LegendCompareRow[] => {
    const sideA: Side = {
        legend: a,
        meta: metaRows.find((row) => row.legendId === a.legend_id) ?? null,
    }
    const sideB: Side = {
        legend: b,
        meta: metaRows.find((row) => row.legendId === b.legend_id) ?? null,
    }

    return metrics.map((metric) => {
        const left = metric.cell(sideA)
        const right = metric.cell(sideB)

        return {
            label: metric.label,
            a: left.text,
            b: right.text,
            winner: winnerOf(left, right, metric.direction),
        }
    })
}
