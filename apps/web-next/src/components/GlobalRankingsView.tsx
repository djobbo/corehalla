import { EntityLink } from "./EntityLink"
import { PageNav } from "@/components/ui/PageNav"
import { SelectField } from "@/components/ui/SelectField"
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
            <p className="ch-panel mt-4 px-4 py-8 text-center text-sm text-textVar1">
                No players on this board yet.
            </p>
        ) : (
            <div className="ch-panel mt-4 overflow-hidden">
                <div className="ch-table-head">
                    <span className="w-7 shrink-0">#</span>
                    <span className="flex-1">Player</span>
                    <span className="w-24 shrink-0 text-right">Tier</span>
                    <span className="w-24 shrink-0 text-right">
                        {metric.label}
                    </span>
                </div>

                {rows.map((row, index) => (
                    <div key={row.id} className="ch-row">
                        <span className="ch-rank">
                            <span>{rankOffset + index + 1}</span>
                        </span>
                        <span className="flex min-w-0 flex-1">
                            <EntityLink
                                type="player"
                                id={row.id}
                                href={playerHref(row.id)}
                                className="ch-link font-semibold"
                            >
                                {cleanString(row.name)}
                            </EntityLink>
                        </span>
                        <span className="w-24 shrink-0 text-right">
                            {/*
                             * Tiers are stored as text and an unranked player
                             * carries an empty one. A chip with no label would
                             * render as a bare coloured block, so the column
                             * holds nothing at all in that case.
                             */}
                            {row.tier ? (
                                <span
                                    className="ch-tier"
                                    style={
                                        {
                                            "--ch-tier": tierColor(row.tier),
                                        } as CSSProperties
                                    }
                                >
                                    {row.tier}
                                </span>
                            ) : null}
                        </span>
                        <span className="ch-rating w-24 shrink-0 text-right">
                            {metric.format(row.prop)}
                        </span>
                    </div>
                ))}
            </div>
        )}

        <PageNav prevHref={prevHref} nextHref={nextHref} />
    </div>
)
