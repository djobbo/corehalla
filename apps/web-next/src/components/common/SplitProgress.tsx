import { cn } from "@/lib/cn"
import { fillClass } from "@/lib/fill"
import type { FillIntent } from "@/lib/fill"

export type { FillIntent } from "@/lib/fill"

export type ProgressSize = "sm" | "md"

const sizeClass = (size: ProgressSize, split: boolean): string | false =>
    size === "sm" && (split ? "ch-progress-split-sm" : "ch-progress-sm")

export type ProgressPart = {
    readonly key: string
    readonly value: number
    readonly intent: FillIntent
}

export const SplitProgress = ({
    parts,
    total,
    size = "md",
    className,
    label,
}: {
    readonly parts: readonly ProgressPart[]
    readonly total?: number
    readonly size?: ProgressSize
    readonly className?: string
    readonly label?: string
}) => {
    const pieces = parts.filter((part) => part.value > 0)
    const accounted = pieces.reduce((sum, part) => sum + part.value, 0)
    // Pass `total` when parts are incomplete; remainder stays a hollow slot.
    const rest = total === undefined ? 0 : Math.max(0, total - accounted)

    // Decorative unless named: role=img keeps it out of the a11y tree unlabeled.
    const a11y =
        label === undefined
            ? ({ "aria-hidden": true } as const)
            : ({ role: "img", "aria-label": label } as const)

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
