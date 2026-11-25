import { Link } from "@tanstack/react-router"
import { Card } from "@/components/ui/card"
import { MetaFloorChips } from "@/components/common/MetaFloorChips"
import { StatGrid } from "@/components/common/StatGrid"
import {
    formatLegendMetaRate,
    legendMetaRank,
    legendMetaRankLabel,
} from "@/lib/legendMeta"
import {
    formatPlayStyleMatchLength,
    formatPlayStylePerGame,
    playStyleUnknown,
} from "@/lib/legendPlayStyle"
import {
    formatMetaCount,
    metaDisclaimer,
    metaFloorSample,
    metaFloorSearch,
} from "@/lib/metaFloor"
import type { Stat } from "@/components/common/StatGrid"
import type { LegendMetaMetric, LegendMetaRow } from "@/lib/legendMeta"
import type { LegendMeta, MetaFloor } from "@crh/api-contract/schemas"

const TITLE_ID = "legend-meta-title"

type MetricDefinition = {
    readonly metric: LegendMetaMetric
    readonly title: string
    readonly format: (row: LegendMetaRow) => string
}

const legendMetaMetrics: readonly MetricDefinition[] = [
    {
        metric: "playShare",
        title: "Play share",
        format: (row) => formatLegendMetaRate(row.playShare),
    },
    {
        metric: "winRate",
        title: "Win rate",
        format: (row) => formatLegendMetaRate(row.winRate),
    },
    {
        metric: "games",
        title: "Games",
        format: (row) => formatMetaCount(row.games),
    },
    {
        metric: "accounts",
        title: "Accounts",
        format: (row) => formatMetaCount(row.accounts),
    },
    {
        metric: "damageDealtPerGame",
        title: "Damage dealt / game",
        format: (row) =>
            formatPlayStylePerGame(row.playStyle.damageDealtPerGame),
    },
    {
        metric: "averageMatchSeconds",
        title: "Average match",
        format: (row) =>
            formatPlayStyleMatchLength(row.playStyle.averageMatchSeconds),
    },
]

export type LegendMetaCardProps = {
    readonly meta: LegendMeta | null
    readonly legendId: number
    readonly floor: MetaFloor
    readonly onFloorChange?: (floor: MetaFloor) => void
}

export const LegendMetaCard = ({
    meta,
    legendId,
    floor,
    onFloorChange,
}: LegendMetaCardProps) => {
    if (meta === null) return null

    const row = meta.data.find((entry) => entry.legendId === legendId)

    const stats: readonly Stat[] = legendMetaMetrics.map(
        ({ metric, title, format }) => {
            const rank = legendMetaRank(meta.data, legendId, metric)

            return {
                title,
                value: (
                    <span className="flex flex-col gap-0.5">
                        <span>
                            {row === undefined ? playStyleUnknown : format(row)}
                        </span>
                        {rank === null ? null : (
                            <span className="ch-stat-label">
                                {legendMetaRankLabel(rank)}
                            </span>
                        )}
                    </span>
                ),
            }
        },
    )

    const boardSearch = metaFloorSearch(floor)

    return (
        <section aria-labelledby={TITLE_ID} className="mt-3">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <p className="ch-kicker">Standing among legends</p>
                    <h2 id={TITLE_ID} className="ch-display mt-1 text-lg">
                        Meta
                    </h2>
                    <p className="mt-1 max-w-prose text-xs text-muted-foreground">
                        {metaFloorSample(meta.meta.accounts, floor)} ·{" "}
                        {metaDisclaimer}
                    </p>
                    <Link
                        to="/legends"
                        search={boardSearch}
                        className="ch-kicker mt-1 inline-flex hover:text-foreground"
                    >
                        Full legend board <span aria-hidden>&rarr;</span>
                    </Link>
                </div>

                <MetaFloorChips floor={floor} onFloorChange={onFloorChange} />
            </div>

            <Card className="mt-3 p-4">
                <StatGrid maxColumns={3} stats={stats} />
            </Card>
        </section>
    )
}
