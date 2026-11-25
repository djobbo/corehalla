import { Link } from "@tanstack/react-router"
import { LegendIcon } from "@/components/legend/LegendIcon"
import { Card } from "@/components/ui/card"
import { landingLegends } from "@/lib/landingLegends"
import { formatLegendMetaRate } from "@/lib/legendMeta"
import { metaFloorSample, metaFloorSearch } from "@/lib/metaFloor"
import { legendHref } from "@/lib/legends"
import type { LegendMeta, MetaFloor } from "@crh/api-contract/schemas"

export type LandingLegendsProps = {
    readonly board: LegendMeta | null
    readonly floor: MetaFloor
    readonly title: string
    readonly titleId: string
}

const Metric = ({
    label,
    value,
}: {
    readonly label: string
    readonly value: string
}) => (
    <span className="flex items-baseline gap-1.5 whitespace-nowrap sm:flex-col sm:items-end sm:gap-0">
        <span className="ch-stat-label">{label}</span>
        <span className="ch-stat-value">{value}</span>
    </span>
)

export const LandingLegends = ({
    board,
    floor,
    title,
    titleId,
}: LandingLegendsProps) => {
    const legends = landingLegends(board, floor)

    if (board === null || legends.length === 0) return null

    return (
        <section aria-labelledby={titleId} className="mt-10">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p id={titleId} className="ch-kicker">
                    {title}
                </p>
                <Link
                    to="/legends"
                    search={metaFloorSearch(floor)}
                    className="text-xs font-bold tracking-[0.12em] text-muted-foreground uppercase transition-colors hover:text-foreground"
                >
                    All legends <span aria-hidden>&rarr;</span>
                </Link>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
                {metaFloorSample(board.meta.accounts, floor)}
            </p>

            <Card className="mt-2 py-0">
                <ol className="divide-y divide-border/50">
                    {legends.map(({ legend, row }) => (
                        <li key={legend.legend_id}>
                            <Link
                                to={legendHref(legend)}
                                className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-1 px-3 py-2 transition-colors hover:bg-bgVar2 sm:grid-cols-[auto_minmax(0,1fr)_auto]"
                            >
                                <LegendIcon
                                    legend={legend}
                                    className="row-span-2 size-9 shrink-0 object-contain sm:row-span-1"
                                />
                                <span className="min-w-0 truncate font-semibold">
                                    {legend.bio_name}
                                </span>
                                <span className="col-start-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 sm:col-start-3 sm:row-start-1 sm:flex-nowrap sm:items-end sm:gap-4">
                                    <Metric
                                        label="Play share"
                                        value={formatLegendMetaRate(
                                            row.playShare,
                                        )}
                                    />
                                    <Metric
                                        label="Win rate"
                                        value={formatLegendMetaRate(
                                            row.winRate,
                                        )}
                                    />
                                </span>
                            </Link>
                        </li>
                    ))}
                </ol>
            </Card>
        </section>
    )
}
