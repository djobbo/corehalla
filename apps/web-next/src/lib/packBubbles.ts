import { hierarchy, pack } from "d3-hierarchy"
import type { BubbleMetric, BubbleNode } from "./bubbles"

export const VIEW = 1000
const PADDING = 10

/**
 * A bubble weighs its share of the largest value, so one with none of the active
 * metric weighs 0 and `d3.pack` draws it with radius 0 — a hole in the chart.
 * The floor keeps it visible: at `1e-3` it packs to ~10 of the heaviest bubble's
 * ~475 units, about 3px once the chart renders at its 304px width.
 */
const MIN_SHARE = 0.001

/**
 * `d3.pack` gives a leaf radius proportional to the square root of its weight, so
 * matching weight to value understates the spread: 4x the playtime draws only 2x
 * the radius. Weighing by `share ** scaleExponent` before that square root tunes
 * the spread per chart: above 1 exaggerates it, below 1 flattens it, and 1 is
 * area-true.
 */
const weight = (
    value: number,
    largest: number,
    scaleExponent: number,
): number =>
    largest <= 0
        ? MIN_SHARE
        : Math.pow(Math.max(MIN_SHARE, value / largest), scaleExponent)

export type PackedBubble = {
    readonly radius: number
    readonly x: number
    readonly y: number
    readonly data: BubbleNode
}

/**
 * `hierarchy` types the node datum as whatever it is handed, so the bare array
 * would make the root's datum that array and pass it to the accessor.
 */
type ClusterDatum = {
    readonly children: readonly BubbleDatum[]
}

type BubbleDatum = {
    readonly kind: "bubble"
    readonly data: BubbleNode
}

/** Keyed on `kind`, not a metric field, which a metric rename would silently break. */
const isBubble = (datum: ClusterDatum | BubbleDatum): datum is BubbleDatum =>
    "kind" in datum

export const packBubbles = (
    bubbles: readonly BubbleNode[],
    metric: BubbleMetric,
    scaleExponent: number,
): readonly PackedBubble[] => {
    const largest = bubbles.reduce(
        (max, bubble) => Math.max(max, bubble[metric]),
        0,
    )

    const root: ClusterDatum = {
        children: bubbles.map((data) => ({
            kind: "bubble" as const,
            data,
        })),
    }

    const packed = pack<ClusterDatum>().size([VIEW, VIEW]).padding(PADDING)(
        hierarchy<ClusterDatum>(root).sum((datum) =>
            isBubble(datum)
                ? weight(datum.data[metric], largest, scaleExponent)
                : 0,
        ),
    )

    // `d3.pack` reorders leaves, so each datum is read back off its node.
    return (packed.children ?? []).flatMap((node) =>
        isBubble(node.data)
            ? [{ radius: node.r, x: node.x, y: node.y, data: node.data.data }]
            : [],
    )
}
