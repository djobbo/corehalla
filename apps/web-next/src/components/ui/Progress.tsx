import { cn } from "@/lib/cn"
import { fillClass } from "./fill"
import type { FillIntent } from "./fill"

export type { FillIntent } from "./fill"

export type ProgressSize = "sm" | "md"

const sizeClass = (size: ProgressSize, split: boolean): string | false =>
    size === "sm" && (split ? "ch-progress-split-sm" : "ch-progress-sm")

/** One piece of a `SplitProgress` bar. */
export type ProgressPart = {
    readonly key: string
    readonly value: number
    readonly intent: FillIntent
}

/**
 * A bar made of proportional pieces, each cut on both ends and separated by a
 * gap — wins and losses, or a total and the causes that account for it.
 *
 * Widths come from `flex-grow`, so the pieces stay proportional without the
 * caller computing percentages, and the gap stays a constant few pixels rather
 * than scaling with a value. Empty pieces are dropped rather than rendered at
 * zero width, because a zero-width flex item still claims a gap.
 *
 * Pass `total` when the pieces are parts of a whole rather than the whole
 * themselves. The unaccounted remainder is then held open as a hollow slot, so
 * a breakdown that does not add up shows that it does not add up instead of
 * stretching its pieces to fill the bar and implying that it does.
 */
export const SplitProgress = ({
    parts,
    total,
    size = "md",
    className,
}: {
    readonly parts: readonly ProgressPart[]
    /** The whole the parts divide. Omit when the parts *are* the whole. */
    readonly total?: number
    readonly size?: ProgressSize
    readonly className?: string
}) => {
    const pieces = parts.filter((part) => part.value > 0)
    const accounted = pieces.reduce((sum, part) => sum + part.value, 0)
    const rest = total === undefined ? 0 : Math.max(0, total - accounted)

    // Nothing to divide: fall back to the bare track so the bar keeps its slot
    // and its shape instead of collapsing the layout.
    if (pieces.length === 0 && rest === 0) {
        return (
            <div
                className={cn("ch-progress", sizeClass(size, false), className)}
            />
        )
    }

    return (
        <div
            className={cn(
                "ch-progress-split",
                sizeClass(size, true),
                className,
            )}
        >
            {pieces.map((part) => (
                <span
                    key={part.key}
                    className={fillClass[part.intent]}
                    style={{ flexGrow: part.value }}
                />
            ))}
            {rest > 0 && (
                <i
                    aria-hidden
                    className="ch-progress-rest"
                    style={{ flexGrow: rest }}
                />
            )}
        </div>
    )
}
