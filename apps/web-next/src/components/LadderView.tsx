import { Link } from "@tanstack/react-router"
import { LadderTable } from "./LadderTable"
import { PageNav } from "@/components/PageNav"
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
 * every change into a scroll back up first. It docks at `--ch-header-h`, the
 * combined height of the pinned masthead and nav, so the three read as one
 * fixed header rather than as bars that happen to be near each other.
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
                <p className="mt-1 text-xs text-muted-foreground">
                    {regionLabel(region)} · page {page}
                </p>
            </header>

            <div className="sticky top-[var(--ch-header-h)] z-20 -mx-4 bg-background/95 px-4 py-2 shadow-[0_3px_0_0_var(--color-ink)] backdrop-blur">
                {/*
                 * Two named landmarks rather than two anonymous rows of links:
                 * a screen reader lists "Bracket" and "Region" as navigation and
                 * can jump straight to either, which is the same promise the
                 * visible layout makes to a sighted reader.
                 */}
                <nav aria-label="Bracket" className="flex flex-wrap gap-1.5">
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
                </nav>
                <nav
                    aria-label="Region"
                    className="mt-1.5 flex flex-wrap gap-1.5"
                >
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
                </nav>
            </div>

            <p className="mt-3 text-[0.66rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                {rows.length} rows
            </p>

            <LadderTable rows={rows} className="mt-2" />

            <PageNav
                prevHref={
                    page > 1 ? ladderHref(bracket, region, page - 1) : undefined
                }
                nextHref={
                    hasNextPage
                        ? ladderHref(bracket, region, page + 1)
                        : undefined
                }
            />
        </div>
    )
}
