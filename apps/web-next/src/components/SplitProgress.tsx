import { cn } from "@/lib/cn"
import { fillClass } from "@/lib/fill"
import type { FillIntent } from "@/lib/fill"

export type { FillIntent } from "@/lib/fill"

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
 * This is deliberately bespoke rather than shadcn's `Progress`. A progress
 * control reports a single value against a maximum, which is a different claim:
 * it can say "40% of the way there", but not "40% of these outcomes, and here is
 * how the rest divides". Several of this app's bars are breakdowns rather than
 * progress, and forcing them through a single-value control would either lose
 * the split or need one control per category — so the split bar stays bespoke,
 * and `.ch-progress-*` in `styles/app.css` carries the shape.
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
    label,
}: {
    readonly parts: readonly ProgressPart[]
    /** The whole the parts divide. Omit when the parts *are* the whole. */
    readonly total?: number
    readonly size?: ProgressSize
    readonly className?: string
    /** An accessible name, since the bar carries meaning the text may not. */
    readonly label?: string
}) => {
    const pieces = parts.filter((part) => part.value > 0)
    const accounted = pieces.reduce((sum, part) => sum + part.value, 0)
    const rest = total === undefined ? 0 : Math.max(0, total - accounted)

    /*
     * A bar is a picture of numbers that are already on the page, so it is
     * decoration unless the caller names it. `role="img"` with a label is what
     * keeps it from being an unlabelled graphic in the accessibility tree.
     */
    const a11y =
        label === undefined
            ? ({ "aria-hidden": true } as const)
            : ({ role: "img", "aria-label": label } as const)

    // Nothing to divide: fall back to the bare track so the bar keeps its slot
    // and its shape instead of collapsing the layout.
    if (pieces.length === 0 && rest === 0) {
        return (
            <div
                {...a11y}
                className={cn("ch-progress", sizeClass(size, false), className)}
            />
        )
    }

    return (
        <div
            {...a11y}
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
