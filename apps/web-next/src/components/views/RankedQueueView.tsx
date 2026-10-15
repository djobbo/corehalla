import { Link } from "@tanstack/react-router"
import { Card } from "@/components/ui/card"
import { EntityLink } from "@/components/common/EntityLink"
import { Empty, EmptyDescription, EmptyHeader } from "@/components/ui/empty"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { PageNav } from "@/components/common/PageNav"
import {
    brackets,
    playerHref,
    regionLabel,
    regions,
    tierColor,
} from "@/lib/rankings"
import { cn } from "@/lib/cn"
import { cleanString } from "@crh/common/helpers/cleanString"
import type { QueuedEntry } from "@crh/api-contract/schemas"
import type { Ladder } from "@crh/api-contract/schemas"
import type { RankedRegion } from "@crh/api-contract/schemas"
import type { CSSProperties } from "react"

const Delta = ({ value }: { readonly value: number }) => {
    if (value === 0) return null

    return (
        <span
            className={cn(
                "ml-1.5 text-xs font-bold",
                value > 0 ? "text-success" : "text-destructive",
            )}
        >
            {value > 0 ? `+${value}` : value}
        </span>
    )
}

type Region = typeof RankedRegion.Type

export const RankedQueueView = ({
    bracket,
    region,
    rows,
    now,
}: {
    readonly bracket: Ladder
    readonly region: Region
    readonly rows: readonly QueuedEntry[]
    readonly now: number
}) => (
    <div>
        <header className="ch-hero mb-3">
            <p className="ch-kicker">Live</p>
            <h1 className="ch-display mt-1 text-2xl">Ranked queue</h1>
            <p className="mt-1 text-xs text-muted-foreground">
                {bracket} · {regionLabel(region)} · {rows.length} playing in the
                last 30 minutes
            </p>
        </header>
        <div className="sticky top-[var(--ch-header-h)] z-20 -mx-4 bg-background/95 px-4 py-2 shadow-[0_3px_0_0_var(--color-ink)] backdrop-blur">
            <nav aria-label="Bracket" className="flex flex-wrap gap-1.5">
                {brackets.map((option) => (
                    <Link
                        key={option}
                        to={queueHref(option, region)}
                        className={cn(
                            "ch-chip",
                            option === bracket ? "ch-chip-on" : "ch-chip-off",
                        )}
                    >
                        {option}
                    </Link>
                ))}
            </nav>
            <nav aria-label="Region" className="mt-1.5 flex flex-wrap gap-1.5">
                {regions.map((option) => (
                    <Link
                        key={option.value}
                        to={queueHref(bracket, option.value)}
                        className={cn(
                            "ch-chip px-2.5 text-[0.62rem] tracking-[0.12em]",
                            option.value === region
                                ? "ch-chip-on"
                                : "ch-chip-off",
                        )}
                    >
                        {option.label}
                    </Link>
                ))}
            </nav>
        </div>
        {rows.length === 0 ? (
            <Empty className="mt-4 rounded-2xl bg-card py-10">
                <EmptyHeader>
                    <EmptyDescription>
                        Nobody has queued on this ladder in the last 30 minutes.
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        ) : (
            <Card className="mt-4 overflow-hidden py-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-16 text-right">#</TableHead>
                            <TableHead>Player</TableHead>
                            <TableHead className="w-24 text-right">
                                Rating
                            </TableHead>
                            <TableHead className="w-24 text-right">
                                Tier
                            </TableHead>
                            <TableHead className="w-20 text-right">
                                Queued
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell className="text-right">
                                    <span className="font-bold tabular-nums">
                                        {row.rank === 0 ? "—" : row.rank}
                                    </span>
                                    <Delta value={-row.rankDelta} />
                                </TableCell>
                                <TableCell>
                                    <span className="flex min-w-0 flex-wrap items-center gap-x-2">
                                        {row.members.map((member, index) => (
                                            <span
                                                key={member.id}
                                                className="flex items-center gap-x-2"
                                            >
                                                {index > 0 ? (
                                                    <span
                                                        aria-hidden
                                                        className="text-white/70"
                                                    >
                                                        &
                                                    </span>
                                                ) : null}
                                                <EntityLink
                                                    type="player"
                                                    id={member.id}
                                                    href={playerHref(
                                                        member.slug,
                                                    )}
                                                    className="font-semibold"
                                                >
                                                    {cleanString(member.name)}
                                                </EntityLink>
                                            </span>
                                        ))}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <span className="font-bold tabular-nums">
                                        {row.rating}
                                    </span>
                                    <Delta value={row.ratingDelta} />
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
                                <TableCell className="text-right text-xs text-muted-foreground">
                                    {now === 0 ? "" : since(row.queuedAt, now)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        )}
        <PageNav />
    </div>
)

export const queueHref = (bracket: Ladder, region: Region): string =>
    region === "all"
        ? `/rankings/queues/${bracket}`
        : `/rankings/queues/${bracket}/${region}`

const since = (queuedAt: number, now: number): string => {
    const minutes = Math.max(0, Math.round((now - queuedAt) / 60_000))

    if (minutes < 1) return "just now"
    if (minutes === 1) return "1m ago"
    if (minutes < 60) return `${minutes}m ago`

    return `${Math.floor(minutes / 60)}h ago`
}
