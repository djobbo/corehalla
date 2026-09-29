import { cn } from "@/lib/cn"
import type { ReactNode } from "react"

/** One labelled figure. `hint` becomes the `title`, for a hover explanation. */
export type Stat = {
    readonly title: string
    readonly value: ReactNode
    readonly hint?: string
}

/**
 * The responsive ladder, keyed by the widest tier a grid may reach.
 *
 * A grid that outruns its contents reads worse than one that stops early — five
 * figures across four columns leaves an orphan stranded on the second row — and
 * only the caller knows how many figures it has. So the top of the ladder is a
 * choice rather than a fixed ramp.
 */
const gridColumns = {
    2: "grid-cols-1 @sm:grid-cols-2",
    3: "grid-cols-1 @sm:grid-cols-2 @2xl:grid-cols-3",
    4: "grid-cols-1 @sm:grid-cols-2 @2xl:grid-cols-3 @5xl:grid-cols-4",
    5: "grid-cols-1 @sm:grid-cols-2 @2xl:grid-cols-3 @5xl:grid-cols-5",
} as const

export type StatGridColumns = keyof typeof gridColumns

/**
 * A responsive grid of labelled figures.
 *
 * Broken by *container* width, not viewport width, because a stat grid is
 * almost always inside a card that is itself one column of a larger grid.
 *
 * The grid therefore establishes its **own** container rather than trusting an
 * ancestor to provide one. A `@container` query with no query container ancestor
 * simply never matches, so a grid that borrowed one from a `Card` collapsed to a
 * single column the moment it was used outside a card — silently, and looking
 * merely "tall" rather than broken.
 *
 * Wrapping also makes the measurement more truthful: the wrapper is exactly the
 * space the grid has to fill, whereas an ancestor card's content box includes its
 * own padding.
 *
 * The labels and figures wear `.ch-stat-label` / `.ch-stat-value` rather than
 * shadcn's `Field`, because this is a definition list of read-only numbers: there
 * is no control to label, so the field vocabulary would describe a form that is
 * not there. `Card` is still the surface it is normally placed in.
 */
export const StatGrid = ({
    stats,
    maxColumns = 4,
    className,
}: {
    readonly stats: readonly Stat[]
    /** The widest tier this grid may reach. */
    readonly maxColumns?: StatGridColumns
    readonly className?: string
}) => (
    <div className="@container">
        <dl className={cn("grid gap-3", gridColumns[maxColumns], className)}>
            {stats.map((stat) => (
                <div key={stat.title} className="flex min-w-0 flex-col">
                    <dt className="ch-stat-label">{stat.title}</dt>
                    <dd className="ch-stat-value" title={stat.hint}>
                        {stat.value}
                    </dd>
                </div>
            ))}
        </dl>
    </div>
)
