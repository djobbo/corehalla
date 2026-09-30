import { calculateWinrate } from "@crh/bhapi/helpers/calculateWinrate"

export const bubbleMetrics = ["matchtime", "kos", "damage_dealt"] as const

export type BubbleMetric = (typeof bubbleMetrics)[number]

/** The three metrics index this type, which is how the pack weighs a leaf. */
export type BubbleNode = {
    readonly key: string
    readonly name: string
    readonly icon: string
    readonly href?: string
    /** Absent for unarmed, which has no weapon level. */
    readonly level?: number
    readonly matchtime: number
    readonly kos: number
    readonly damage_dealt: number
    /** Absent for unarmed, which has no win/loss record of its own. */
    readonly games?: number
    readonly wins?: number
}

export const formatMetric = (
    bubble: BubbleNode,
    metric: BubbleMetric,
): string => Math.round(bubble[metric]).toLocaleString()

/** Null when the source reports no record to winrate over. */
export const bubbleWinrate = (bubble: BubbleNode): number | null =>
    bubble.games === undefined || bubble.wins === undefined
        ? null
        : calculateWinrate(bubble.wins, bubble.games)
