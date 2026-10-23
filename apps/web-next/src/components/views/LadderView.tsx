import { Link } from "@tanstack/react-router"
import { LadderTable } from "@/components/common/LadderTable"
import { PageNav } from "@/components/common/PageNav"
import { UpdatedAt } from "@/components/common/UpdatedAt"
import { brackets, ladderHref, regionLabel, regions } from "@/lib/rankings"
import { cn } from "@/lib/cn"
import type { LadderRow } from "@/lib/ladderRows"
import type { Bracket } from "@/lib/rankings"
import type { RankedRegion } from "@crh/api-contract/schemas"

type Region = typeof RankedRegion.Type

export type LadderViewProps = {
    readonly bracket: Bracket
    readonly region: Region
    readonly page: number
    readonly rows: readonly LadderRow[]
    readonly hasNextPage: boolean
    readonly updatedAt: number
}

export const LadderView = ({
    bracket,
    region,
    page,
    rows,
    hasNextPage,
    updatedAt,
}: LadderViewProps) => {
    return (
        <div>
            <header className="ch-hero mb-3">
                <p className="ch-kicker">Live ladder</p>
                <h1 className="ch-display mt-1 text-2xl">{bracket} rankings</h1>
                <p className="mt-1 text-xs text-muted-foreground">
                    {regionLabel(region)} · page {page}
                </p>
                <UpdatedAt at={updatedAt} className="block" />
            </header>
            <div className="sticky top-[var(--ch-header-h)] z-20 -mx-4 bg-background/95 px-4 py-2 shadow-[0_3px_0_0_var(--color-ink)] backdrop-blur">
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
