import { legends, legendsMap } from "@crh/bhapi/legends"
import type { Legend } from "@crh/bhapi/types"

export const tierNames = ["S", "A", "B", "C", "D", "F"] as const
export type TierName = (typeof tierNames)[number]

/** Legend ids per tier, in the order they appear on the board. */
export type TierBoard = Readonly<Record<TierName, readonly number[]>>

export const emptyTierBoard: TierBoard = {
    S: [],
    A: [],
    B: [],
    C: [],
    D: [],
    F: [],
}

const rosterIds: ReadonlySet<number> = new Set(
    legends.map((legend) => legend.legend_id),
)

/** `S:3,4;A:5` — one section per non-empty tier. */
const SECTION = new RegExp(`^(${tierNames.join("|")}):(\\d+(?:,\\d+)*)$`)

export const encodeTierBoard = (board: TierBoard): string =>
    tierNames
        .flatMap((tier) => {
            const ids = board[tier]

            return ids.length === 0 ? [] : [`${tier}:${ids.join(",")}`]
        })
        .join(";")

export const decodeTierBoard = (value: unknown): TierBoard => {
    if (typeof value !== "string" || value === "") return emptyTierBoard

    const board: Record<TierName, number[]> = {
        S: [],
        A: [],
        B: [],
        C: [],
        D: [],
        F: [],
    }
    const placed = new Set<number>()
    const sections = new Set<string>()

    for (const section of value.split(";")) {
        const match = SECTION.exec(section)

        if (match === null) return emptyTierBoard

        const tier = match[1] as TierName

        // A tier may appear once, so the link has exactly one spelling.
        if (sections.has(tier)) return emptyTierBoard
        sections.add(tier)

        for (const token of match[2].split(",")) {
            const id = Number(token)

            if (!rosterIds.has(id) || placed.has(id)) continue

            placed.add(id)
            board[tier].push(id)
        }
    }

    return board
}

export const placeLegend = (
    board: TierBoard,
    legendId: number,
    tier: TierName | null,
): TierBoard => {
    const without = (ids: readonly number[]): readonly number[] =>
        ids.filter((id) => id !== legendId)

    const move = (name: TierName): readonly number[] => {
        const remaining = without(board[name])

        return name === tier ? [...remaining, legendId] : remaining
    }

    return {
        S: move("S"),
        A: move("A"),
        B: move("B"),
        C: move("C"),
        D: move("D"),
        F: move("F"),
    }
}

export const tierLegends = (
    board: TierBoard,
    tier: TierName,
): readonly Legend[] =>
    board[tier].flatMap((id) => {
        const legend = legendsMap[id]

        return legend === undefined ? [] : [legend]
    })

export const poolLegends = (board: TierBoard): readonly Legend[] => {
    const placed = new Set(tierNames.flatMap((tier) => board[tier]))

    return legends.filter((legend) => !placed.has(legend.legend_id))
}

export const tierListHref = (board: TierBoard): string => {
    const encoded = encodeTierBoard(board)

    return encoded === "" ? "/tiers" : `/tiers?t=${encodeURIComponent(encoded)}`
}

/**
 * The `?t=` value in its one canonical spelling, or `undefined` for an empty
 * board. Malformed input collapses to the empty board, never an error.
 */
export const canonicalTierSearch = (value: unknown): string | undefined => {
    const encoded = encodeTierBoard(decodeTierBoard(value))

    return encoded === "" ? undefined : encoded
}
