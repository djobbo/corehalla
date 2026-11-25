import type { QueuedEntry } from "@crh/api-contract/schemas"

export const QUEUE_HIGHLIGHT_LIMIT = 5

export type QueueHighlights = {
    /** Largest rating gain first. */
    readonly climbers: readonly QueuedEntry[]
    /** Largest rating loss first. */
    readonly drops: readonly QueuedEntry[]
}

const byId = (a: QueuedEntry, b: QueuedEntry): number =>
    a.id < b.id ? -1 : a.id > b.id ? 1 : 0

/** Ties go to the higher rating, then the id, so a queue renders in the same order every time. */
const byTieBreak = (a: QueuedEntry, b: QueuedEntry): number =>
    b.rating - a.rating || byId(a, b)

/**
 * The table buries rating movement in a two-digit delta, so the queue page
 * lifts the biggest movers into their own lists. A zero change is neither a
 * climb nor a drop: it stays out of both.
 */
export const queueHighlights = (
    rows: readonly QueuedEntry[],
    limit: number = QUEUE_HIGHLIGHT_LIMIT,
): QueueHighlights => ({
    climbers: rows
        .filter((row) => row.ratingDelta > 0)
        .sort((a, b) => b.ratingDelta - a.ratingDelta || byTieBreak(a, b))
        .slice(0, limit),
    drops: rows
        .filter((row) => row.ratingDelta < 0)
        .sort((a, b) => a.ratingDelta - b.ratingDelta || byTieBreak(a, b))
        .slice(0, limit),
})
