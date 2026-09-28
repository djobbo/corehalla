import { EntityLink } from "./EntityLink"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { playerHref, tierColor } from "@/lib/rankings"
import { cn } from "@/lib/cn"
import type { LadderRow } from "@/lib/ladderRows"
import type { CSSProperties } from "react"

/**
 * A ranked ladder as a table: one head row, then one row per rank.
 *
 * Split out of `LadderView` because the home page renders the same table
 * without that view's filters or pagination — it is a *preview* of the ladder
 * rather than the ladder. Copying the markup would give a column two homes, and
 * a preview that drifts from the table it previews is worse than no preview:
 * the reader would have no way to tell which one was lying.
 *
 * It is a real `<table>` rather than a stack of flex `div`s, which is the whole
 * accessibility point of this component: each value now sits in the column its
 * header names, a screen reader can announce "rating, 2103" instead of reading
 * an undifferentiated run of text, and the head row is reachable as a unit. The
 * row rule, the header fill and the hover come from shadcn's `Table` (see
 * `table.tsx`), so this file only owns the content of each cell.
 *
 * The player cell carries the link, not the row: a row that was itself a button
 * would be one enormous hit target that cannot be opened in a new tab, and the
 * name is the row's primary action. Rank and tier are the two places colour is
 * allowed to speak — the rank badge for the podium, the tier chip for the
 * ladder's own ramp.
 */
export const LadderTable = ({
    rows,
    className,
}: {
    readonly rows: readonly LadderRow[]
    readonly className?: string
}) => (
    <div className={cn("overflow-hidden bg-card", className)}>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-7">#</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead className="w-14 text-right">Rating</TableHead>
                    <TableHead className="w-24 text-right">Tier</TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                {rows.map((row) => (
                    <TableRow key={row.key}>
                        <TableCell>
                            <span
                                className={cn(
                                    "ch-rank",
                                    row.rank <= 3 && `ch-rank-${row.rank}`,
                                )}
                            >
                                <span>{row.rank}</span>
                            </span>
                        </TableCell>
                        <TableCell>
                            {/*
                             * A team shares one rank, so the cell holds every
                             * member and lets them wrap. `min-w-0` lets the
                             * column shrink instead of forcing the table wider
                             * than the page.
                             */}
                            <span className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-0.5">
                                {row.members.map((member) => (
                                    <EntityLink
                                        key={member.id}
                                        type="player"
                                        id={member.id}
                                        href={playerHref(member.id)}
                                        className="font-semibold"
                                    >
                                        {member.name}
                                    </EntityLink>
                                ))}
                            </span>
                        </TableCell>
                        <TableCell className="text-right font-bold tabular-nums">
                            {row.rating}
                        </TableCell>
                        <TableCell className="text-right">
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
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
)
