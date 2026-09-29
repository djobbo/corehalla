import { EntityLink } from "./EntityLink"
import { Empty, EmptyDescription, EmptyHeader } from "@/components/ui/empty"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { PageNav } from "@/components/PageNav"
import { SelectField } from "@/components/SelectField"
import { playerHref, tierColor } from "@/lib/rankings"
import { cleanString } from "@crh/common/helpers/cleanString"
import type { CareerRanking } from "@crh/api-contract/schemas"
import type { CSSProperties } from "react"

export const CareerRankingsView = <K extends string>({
    rows,
    sortBy,
    sorts,
    onSortChange,
    metric,
    rankOffset,
    prevHref,
    nextHref,
}: {
    readonly rows: readonly CareerRanking[]
    readonly sortBy: K
    readonly sorts: readonly { readonly value: K; readonly label: string }[]
    readonly onSortChange: (value: K) => void
    readonly metric: {
        readonly label: string
        readonly format: (value: number) => string
    }
    readonly rankOffset: number
    readonly prevHref?: string | undefined
    readonly nextHref?: string | undefined
}) => (
    <div>
        <SelectField
            label="Rank by"
            value={sortBy}
            options={sorts}
            onChange={onSortChange}
            className="sm:max-w-sm"
        />

        {rows.length === 0 ? (
            <Empty className="mt-4 bg-card py-8">
                <EmptyHeader>
                    <EmptyDescription>
                        No players on this board yet.
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        ) : (
            <div className="mt-4 overflow-hidden bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-7">#</TableHead>
                            <TableHead>Player</TableHead>
                            <TableHead className="w-24 text-right">
                                Tier
                            </TableHead>
                            <TableHead className="w-24 text-right">
                                {metric.label}
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((row, index) => (
                            <TableRow key={row.id}>
                                <TableCell>
                                    <span className="ch-rank">
                                        <span>{rankOffset + index + 1}</span>
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <EntityLink
                                        type="player"
                                        id={row.id}
                                        href={playerHref(row.slug)}
                                        className="font-semibold"
                                    >
                                        {cleanString(row.name)}
                                    </EntityLink>
                                </TableCell>
                                <TableCell className="text-right">
                                    {row.tier ? (
                                        <span
                                            className="ch-tier"
                                            style={
                                                {
                                                    "--ch-tier": tierColor(
                                                        row.tier,
                                                    ),
                                                } as CSSProperties
                                            }
                                        >
                                            {row.tier}
                                        </span>
                                    ) : null}
                                </TableCell>
                                <TableCell className="text-right font-bold tabular-nums">
                                    {metric.format(row.prop)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        )}
        <PageNav prevHref={prevHref} nextHref={nextHref} />
    </div>
)
