import { SplitProgress } from "@/components/SplitProgress"
import { fillClass } from "@/lib/fill"
import { cn } from "@/lib/cn"
import type { FillIntent } from "@/lib/fill"

/** One named cause within a total. */
export type BreakdownEntry = {
    readonly key: string
    readonly label: string
    readonly value: number
    readonly intent: FillIntent
}

/**
 * A total, the causes that make it up, and the two together.
 *
 * The shape is a total with a stacked bar and a legend rather than a list of
 * rows, because these numbers are only meaningful against each other: "4,312
 * unarmed KOs" says little until it sits next to 180,000 weapon KOs. Reading it
 * as one bar makes the proportion the headline and the counts the footnote.
 *
 * The bar is drawn against `total`, so a breakdown whose parts do not account
 * for the whole shows the shortfall as a hollow slot instead of silently
 * rescaling. Pass `max` when several breakdowns should be comparable: they then
 * share one scale, and each one's shortfall is the difference between its own
 * total and that shared maximum.
 */
export const Breakdown = ({
    title,
    total,
    max,
    entries,
    className,
}: {
    readonly title: string
    readonly total: number
    /** A shared bar scale, when this breakdown is read against its siblings. */
    readonly max?: number
    readonly entries: readonly BreakdownEntry[]
    readonly className?: string
}) => {
    /*
     * A part with no value is not a part. `SplitProgress` already drops empty
     * pieces from the bar, so the legend has to drop them too — otherwise the
     * key grows an entry for something that never happened and stops matching
     * the chart beside it.
     */
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

            {/*
             * A key is only worth drawing when a colour needs explaining. With a
             * single part the heading already names the whole thing, so the
             * legend would just repeat the total back.
             */}
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
