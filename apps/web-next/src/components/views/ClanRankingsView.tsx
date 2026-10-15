import { EntityLink } from "@/components/common/EntityLink"
import { Empty, EmptyDescription, EmptyHeader } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { PageNav } from "@/components/common/PageNav"
import { clanHref } from "@/lib/rankings"
import { cn } from "@/lib/cn"
import { useId } from "react"
import { cleanString } from "@crh/common/helpers/cleanString"
import { formatUnixTime } from "@crh/common/helpers/date"
import type { ClansSchema } from "@crh/api-contract/schemas"

type ClanRow = (typeof ClansSchema.Type)[number]

export const ClanRankingsView = ({
    rows,
    query,
    onQueryChange,
    resultQuery,
    rankOffset,
    prevHref,
    nextHref,
}: {
    readonly rows: readonly ClanRow[]
    readonly query: string
    readonly onQueryChange: (value: string) => void
    readonly resultQuery: string
    readonly rankOffset: number | null
    readonly prevHref?: string | undefined
    readonly nextHref?: string | undefined
}) => {
    const searchId = useId()

    return (
        <div>
            <div className="flex flex-col gap-1 sm:max-w-sm">
                <label htmlFor={searchId} className="ch-stat-label">
                    Search guilds
                </label>
                <Input
                    id={searchId}
                    type="search"
                    value={query}
                    placeholder="Guild name"
                    onChange={(event) => onQueryChange(event.target.value)}
                />
            </div>
            {rows.length === 0 ? (
                <Empty className="mt-4 bg-card py-8">
                    <EmptyHeader>
                        <EmptyDescription>
                            {resultQuery
                                ? `No guilds match “${resultQuery}”.`
                                : "No guilds have been indexed yet."}
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : (
                <div className="mt-4 overflow-hidden bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {rankOffset === null ? null : (
                                    <TableHead className="w-7">#</TableHead>
                                )}
                                <TableHead>Guild</TableHead>
                                <TableHead className="w-28 text-right">
                                    Created
                                </TableHead>
                                <TableHead className="w-24 text-right">
                                    XP
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.map((clan, index) => (
                                <TableRow key={clan.id}>
                                    {rankOffset === null ? null : (
                                        <TableCell>
                                            <span className="ch-rank">
                                                <span>
                                                    {rankOffset + index + 1}
                                                </span>
                                            </span>
                                        </TableCell>
                                    )}
                                    <TableCell>
                                        <EntityLink
                                            type="clan"
                                            id={clan.id}
                                            href={clanHref(clan.slug)}
                                            className="font-semibold"
                                        >
                                            {cleanString(clan.name)}
                                        </EntityLink>
                                    </TableCell>
                                    <TableCell
                                        className={cn(
                                            "text-right text-xs",
                                            clan.created && clan.created > 0
                                                ? "text-muted-foreground"
                                                : "text-muted-foreground/50",
                                        )}
                                    >
                                        {clan.created && clan.created > 0
                                            ? formatUnixTime(clan.created)
                                            : "—"}
                                    </TableCell>
                                    <TableCell className="text-right font-bold tabular-nums">
                                        {clan.xp.toLocaleString()}
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
}
