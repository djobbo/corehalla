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
import type { GlobalPlayerRanking } from "@crh/api-contract/schemas"
import type { CSSProperties } from "react"

/**
 * One stat leaderboard: pick a column, read a page of players.
 *
 * Shared by all three boards — career totals, per-legend and per-weapon —
 * because they are the same page with different data behind them. The row has
 * to be identical across them for the comparison to be fair: a reader moving
 * from "most KOs overall" to "most KOs with Bodvar" should be looking at the
 * same table.
 *
 * It is a real `<table>`, so the sorted column's heading is attached to every
 * value under it rather than merely being printed above them.
 *
 * The sorted column is named in the header and its value is the row's last
 * cell, so the ordering is always visible on screen. A board that ranked by a
 * number it never printed would be asking the reader to take it on faith.
 *
 * Paging is offset-based and `rankOffset` continues the numbering across pages
 * rather than restarting at 1, which is what makes row 51 of a board read as
 * 51st rather than as first.
 */
export const GlobalRankingsView = <K extends string>({
    rows,
    sortBy,
    sorts,
    onSortChange,
    metric,
    rankOffset,
    prevHref,
    nextHref,
}: {
    readonly rows: readonly GlobalPlayerRanking[]
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
            /*
             * The board is a table with no rows, so the empty state takes the
             * surface the table would have filled. It is `Empty` rather than a
             * centred paragraph so every empty list in the app announces
             * itself the same way.
             */
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
                                        href={playerHref(row.id)}
                                        className="font-semibold"
                                    >
                                        {cleanString(row.name)}
                                    </EntityLink>
                                </TableCell>
                                <TableCell className="text-right">
                                    {/*
                                     * Tiers are stored as text and an unranked
                                     * player carries an empty one. A chip with
                                     * no label would render as a bare coloured
                                     * block, so the column holds nothing at all
                                     * in that case.
                                     */}
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
