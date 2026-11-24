import { legendsMap } from "@crh/bhapi/legends"
import { Link } from "@tanstack/react-router"
import { Card } from "@/components/ui/card"
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle,
} from "@/components/ui/empty"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { SelectField } from "@/components/common/SelectField"
import { cn } from "@/lib/cn"
import { legendHref } from "@/lib/legends"
import {
    formatLegendMetaCount,
    formatLegendMetaRate,
    legendMetaDisclaimer,
    legendMetaEmpty,
    legendMetaFloorLabel,
    legendMetaSample,
    legendMetaSorts,
} from "@/lib/legendMeta"
import { useSortBy } from "@/lib/useSortBy"
import { legendMetaFloors } from "@crh/api-contract/schemas"
import { LegendIcon } from "./LegendIcon"
import type { LegendMetaSort, LegendMetaRow } from "@/lib/legendMeta"
import type { LegendMeta, LegendMetaFloor } from "@crh/api-contract/schemas"

export type LegendMetaBoardProps = {
    readonly board: LegendMeta
    readonly floor: LegendMetaFloor
    readonly onFloorChange?: (floor: LegendMetaFloor) => void
}

export const LegendMetaBoard = ({
    board,
    floor,
    onFloorChange,
}: LegendMetaBoardProps) => {
    const { sorted, key, setKey, choices } = useSortBy<
        LegendMetaRow,
        LegendMetaSort
    >(board.data, legendMetaSorts, "playShare")

    return (
        <section aria-labelledby="legend-meta-title" className="mb-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <p className="ch-kicker">Pick and win rates</p>
                    <h2
                        id="legend-meta-title"
                        className="ch-display mt-1 text-lg"
                    >
                        Legend meta
                    </h2>
                    <p className="mt-1 max-w-prose text-xs text-muted-foreground">
                        {legendMetaSample(board.meta.accounts, floor)} ·{" "}
                        {legendMetaDisclaimer}
                    </p>
                </div>

                <fieldset className="flex min-w-0 flex-col gap-1">
                    <legend className="ch-stat-label">Rating floor</legend>
                    <div className="flex flex-wrap gap-1.5">
                        {legendMetaFloors.map((option) => (
                            <button
                                key={option}
                                type="button"
                                aria-pressed={option === floor}
                                onClick={() => onFloorChange?.(option)}
                                className={cn(
                                    "ch-chip",
                                    option === floor
                                        ? "ch-chip-on"
                                        : "ch-chip-off",
                                )}
                            >
                                {legendMetaFloorLabel(option)}
                            </button>
                        ))}
                    </div>
                </fieldset>
            </div>

            {sorted.length === 0 ? (
                <Empty className="mt-4 rounded-2xl bg-card py-10">
                    <EmptyHeader>
                        <EmptyTitle>No sample</EmptyTitle>
                        <EmptyDescription>
                            {legendMetaEmpty(floor)}
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : (
                <>
                    <SelectField
                        label="Sort by"
                        value={key}
                        options={choices}
                        onChange={setKey}
                        className="mt-3 sm:max-w-xs"
                    />

                    <Card className="mt-3 overflow-hidden py-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Legend</TableHead>
                                    <TableHead className="w-24 text-right">
                                        Play share
                                    </TableHead>
                                    <TableHead className="w-24 text-right">
                                        Win rate
                                    </TableHead>
                                    <TableHead className="w-20 text-right">
                                        Games
                                    </TableHead>
                                    <TableHead className="w-24 text-right">
                                        Accounts
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sorted.map((row) => {
                                    const legend = legendsMap[row.legendId]

                                    if (legend === undefined) return null

                                    return (
                                        <TableRow key={row.legendId}>
                                            <TableCell>
                                                <Link
                                                    to={legendHref(legend)}
                                                    className="flex items-center gap-2 font-semibold transition-colors hover:text-ring"
                                                >
                                                    <LegendIcon
                                                        legend={legend}
                                                        className="size-7 shrink-0 object-contain"
                                                    />
                                                    {legend.bio_name}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="text-right font-bold tabular-nums">
                                                {formatLegendMetaRate(
                                                    row.playShare,
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">
                                                {formatLegendMetaRate(
                                                    row.winRate,
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">
                                                {formatLegendMetaCount(
                                                    row.games,
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums text-muted-foreground">
                                                {formatLegendMetaCount(
                                                    row.accounts,
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </Card>
                </>
            )}
        </section>
    )
}
