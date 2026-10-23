import { Card } from "@/components/ui/card"
import { EntityLink } from "@/components/common/EntityLink"
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

export const LadderTable = ({
    rows,
    className,
}: {
    readonly rows: readonly LadderRow[]
    readonly className?: string
}) => (
    // A `Card`, so a table panel is the same rounded surface as every other.
    <Card className={cn("overflow-hidden py-0", className)}>
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
                            <span className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-0.5">
                                {row.members.map((member) => (
                                    <EntityLink
                                        key={member.id}
                                        type="player"
                                        id={member.id}
                                        href={playerHref(member.slug)}
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
    </Card>
)
