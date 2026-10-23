import { SplitProgress } from "@/components/common/SplitProgress"
import { fillClass } from "@/lib/fill"
import { cn } from "@/lib/cn"
import type { FillIntent } from "@/lib/fill"

export type BreakdownEntry = {
    readonly key: string
    readonly label: string
    readonly value: number
    readonly intent: FillIntent
}

export const Breakdown = ({
    title,
    total,
    max,
    entries,
    className,
}: {
    readonly title: string
    readonly total: number
    readonly max?: number
    readonly entries: readonly BreakdownEntry[]
    readonly className?: string
}) => {
    // Drop zero parts so the legend matches the bar (SplitProgress also drops them).
    const shown = entries.filter((entry) => entry.value > 0)

    return (
        <div className={cn("flex flex-col gap-3", className)}>
            <p className="ch-display text-3xl">
                {total.toLocaleString()}
                <span className="ml-2 text-sm font-normal tracking-normal normal-case text-muted-foreground">
                    {title}
                </span>
            </p>
            <SplitProgress
                label={`${title}, ${total.toLocaleString()} in total`}
                total={max ?? total}
                parts={shown.map((entry) => ({
                    key: entry.key,
                    value: entry.value,
                    intent: entry.intent,
                }))}
            />

            {shown.length > 1 && (
                <ul className="flex flex-wrap gap-x-6 gap-y-2">
                    {shown.map((entry) => (
                        <li key={entry.key} className="flex items-start gap-2">
                            <span
                                aria-hidden
                                className={cn(
                                    "ch-dot",
                                    fillClass[entry.intent],
                                )}
                            />
                            <span className="flex flex-col leading-tight">
                                <span className="text-sm font-bold tabular-nums">
                                    {entry.value.toLocaleString()}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {entry.label}
                                </span>
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
