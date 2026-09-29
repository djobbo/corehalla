import { cn } from "@/lib/cn"
import type { ReactNode } from "react"

export type Stat = {
    readonly title: string
    readonly value: ReactNode
    readonly hint?: string
}

const gridColumns = {
    2: "grid-cols-1 @sm:grid-cols-2",
    3: "grid-cols-1 @sm:grid-cols-2 @2xl:grid-cols-3",
    4: "grid-cols-1 @sm:grid-cols-2 @2xl:grid-cols-3 @5xl:grid-cols-4",
    5: "grid-cols-1 @sm:grid-cols-2 @2xl:grid-cols-3 @5xl:grid-cols-5",
} as const

export type StatGridColumns = keyof typeof gridColumns

export const StatGrid = ({
    stats,
    maxColumns = 4,
    className,
}: {
    readonly stats: readonly Stat[]
    readonly maxColumns?: StatGridColumns
    readonly className?: string
}) => (
    // Own `@container` so queries work outside a card ancestor.
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
