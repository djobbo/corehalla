import { Link } from "@tanstack/react-router"
import { LadderTable } from "./LadderTable"
import { brackets, ladderHref, regionLabel, regions } from "@/lib/rankings"
import { cn } from "@/lib/cn"
import type { LadderRow } from "@/lib/ladderRows"
import type { Bracket } from "@/lib/rankings"
import type { RankedRegion } from "@crh/api-contract/schemas"

/** The schema is a value; its decoded type is `Type`. */
type Region = typeof RankedRegion.Type

/**
 * A ranked ladder: the filter row, the table, and the page controls.
 *
 * Both axes are one tap each, which is the whole point — the app this replaces
 * puts the same choice behind two dropdowns holding ten and five options, so
 * changing ladder and region cost four taps. The filter row is sticky because
 * the ladder is a surface to scroll, and losing the controls off the top turns
 * every change into a scroll back up first. It docks at `top-14`, directly under
 * the pinned masthead, so the two read as one fixed header.
 *
 * The table itself is `LadderTable`, shared with the home page's preview — this
 * view adds the parts that only a real ladder page has: the title band, the
 * filters, and the previous/next controls.
 */
export type LadderViewProps = {
    readonly bracket: Bracket
    readonly region: Region
    readonly page: number
    readonly rows: readonly LadderRow[]
    /** Whether a next page exists, from the row count of this one. */
    readonly hasNextPage: boolean
}

export const LadderView = ({
    bracket,
    region,
    page,
    rows,
    hasNextPage,
}: LadderViewProps) => {
    return (
        <div>
            {/*
             * One short title band, not a hero: it gives every ladder page an
             * `h1` and the view its titleplate without pushing the first row of
             * ranks any further down than a heading would have anyway.
             */}
            <header className="ch-hero mb-3">
                <p className="ch-kicker">Live ladder</p>
                <h1 className="ch-display mt-1 text-2xl">{bracket} rankings</h1>
                <p className="mt-1 text-xs text-textVar1">
                    {regionLabel(region)} · page {page}
                </p>
            </header>

            <div className="sticky top-14 z-20 -mx-4 bg-bgVar1/95 px-4 py-2 shadow-[0_3px_0_0_var(--color-ink)] backdrop-blur">
                <div className="flex flex-wrap gap-1.5">
                    {brackets.map((option) => (
                        <Link
                            key={option}
                            to={ladderHref(option, region, page)}
                            className={cn(
                                "ch-chip",
                                option === bracket
                                    ? "ch-chip-on"
                                    : "ch-chip-off",
                            )}
                        >
                            {option}
                        </Link>
                    ))}
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {regions.map((option) => (
                        <Link
                            key={option.value}
                            to={ladderHref(bracket, option.value, 1)}
                            className={cn(
                                "ch-chip px-2.5 text-[0.62rem] tracking-[0.12em]",
                                option.value === region
                                    ? "ch-chip-on"
                                    : "ch-chip-off",
                            )}
                        >
                            {option.label}
                        </Link>
                    ))}
                </div>
            </div>

            <p className="mt-3 text-[0.66rem] font-bold uppercase tracking-[0.16em] text-textVar1">
                {rows.length} rows
            </p>

            <LadderTable rows={rows} className="mt-2" />

            <div className="mt-4 flex gap-2">
                {page > 1 && (
                    <Link
                        to={ladderHref(bracket, region, page - 1)}
                        className="ch-btn"
                    >
                        ← Previous
                    </Link>
                )}
                {hasNextPage && (
                    <Link
                        to={ladderHref(bracket, region, page + 1)}
                        className="ch-btn"
                    >
                        Next →
                    </Link>
                )}
            </div>
        </div>
    )
}
