import { legendsMap } from "@crh/bhapi/legends"
import { Link } from "@tanstack/react-router"
import { Card } from "@/components/ui/card"
import { MetaFloorChips } from "@/components/common/MetaFloorChips"
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
import { legendHref } from "@/lib/legends"
import {
    formatLegendMetaRate,
    legendMetaDefaultDirection,
    legendMetaDefaultSort,
    legendMetaSorts,
} from "@/lib/legendMeta"
import {
    formatMetaCount,
    metaDisclaimer,
    metaEmpty,
    metaFloorSample,
} from "@/lib/metaFloor"
import {
    formatPlayStyleMatchLength,
    formatPlayStylePerGame,
} from "@/lib/legendPlayStyle"
import { useSortBy } from "@/lib/useSortBy"
import { LegendIcon } from "./LegendIcon"
import type { LegendMetaSort, LegendMetaRow } from "@/lib/legendMeta"
import type { LegendMeta, MetaFloor } from "@crh/api-contract/schemas"

export type LegendMetaBoardProps = {
    readonly board: LegendMeta
    readonly floor: MetaFloor
    readonly onFloorChange?: (floor: MetaFloor) => void
}

/** The phone row: the columns the board stacks under the legend name. */
const PhoneRecord = ({ row }: { readonly row: LegendMetaRow }) => (
    <span className="mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5 text-[0.66rem] text-muted-foreground sm:hidden">
        <span>{formatLegendMetaRate(row.winRate)} win rate</span>
        <span>
            {formatPlayStylePerGame(row.playStyle.damageDealtPerGame)} damage
        </span>
        <span>
            {formatPlayStyleMatchLength(row.playStyle.averageMatchSeconds)}{" "}
            match
        </span>
        <span>
            {formatPlayStylePerGame(row.playStyle.suicidesPer100Games)} suicides
        </span>
        <span>{formatMetaCount(row.games)} games</span>
    </span>
)

export const LegendMetaBoard = ({
    board,
    floor,
    onFloorChange,
}: LegendMetaBoardProps) => {
    const { sorted, key, setKey, choices } = useSortBy<
        LegendMetaRow,
        LegendMetaSort
    >(
        board.data,
        legendMetaSorts,
        legendMetaDefaultSort,
        legendMetaDefaultDirection,
    )

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
                        {metaFloorSample(board.meta.accounts, floor)} ·{" "}
                        {metaDisclaimer}
                    </p>
                </div>

                <MetaFloorChips floor={floor} onFloorChange={onFloorChange} />
            </div>

            {sorted.length === 0 ? (
                <Empty className="mt-4 rounded-none bg-card shadow-md py-10">
                    <EmptyHeader>
                        <EmptyTitle>No sample</EmptyTitle>
                        <EmptyDescription>
                            {metaEmpty("legend", floor)}
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
                                    <TableHead className="w-20 text-right">
                                        Play share
                                    </TableHead>
                                    <TableHead className="hidden w-20 text-right sm:table-cell">
                                        Win rate
                                    </TableHead>
                                    <TableHead className="hidden w-28 text-right sm:table-cell">
                                        Damage / game
                                    </TableHead>
                                    <TableHead className="hidden w-24 text-right sm:table-cell">
                                        Average match
                                    </TableHead>
                                    <TableHead className="hidden w-24 text-right sm:table-cell">
                                        Suicides / 100
                                    </TableHead>
                                    <TableHead className="hidden w-20 text-right sm:table-cell">
                                        Games
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sorted.map((row) => {
                                    const legend = legendsMap[row.legendId]

                                    if (legend === undefined) return null

                                    return (
                                        <TableRow key={row.legendId}>
                                            <TableCell className="whitespace-normal">
                                                <Link
                                                    to={legendHref(legend)}
                                                    className="flex items-center gap-2 font-semibold transition-colors hover:text-ring"
                                                >
                                                    <LegendIcon
                                                        legend={legend}
                                                        className="size-7 shrink-0 object-contain"
                                                    />
                                                    <span className="flex min-w-0 flex-col">
                                                        {legend.bio_name}
                                                        <PhoneRecord
                                                            row={row}
                                                        />
                                                    </span>
                                                </Link>
                                            </TableCell>
                                            <TableCell className="text-right font-bold tabular-nums">
                                                {formatLegendMetaRate(
                                                    row.playShare,
                                                )}
                                            </TableCell>
                                            <TableCell className="hidden text-right tabular-nums sm:table-cell">
                                                {formatLegendMetaRate(
                                                    row.winRate,
                                                )}
                                            </TableCell>
                                            <TableCell className="hidden text-right tabular-nums sm:table-cell">
                                                {formatPlayStylePerGame(
                                                    row.playStyle
                                                        .damageDealtPerGame,
                                                )}
                                            </TableCell>
                                            <TableCell className="hidden text-right tabular-nums sm:table-cell">
                                                {formatPlayStyleMatchLength(
                                                    row.playStyle
                                                        .averageMatchSeconds,
                                                )}
                                            </TableCell>
                                            <TableCell className="hidden text-right tabular-nums sm:table-cell">
                                                {formatPlayStylePerGame(
                                                    row.playStyle
                                                        .suicidesPer100Games,
                                                )}
                                            </TableCell>
                                            <TableCell className="hidden text-right tabular-nums text-muted-foreground sm:table-cell">
                                                {formatMetaCount(row.games)}
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
