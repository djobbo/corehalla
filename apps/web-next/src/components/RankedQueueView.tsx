import { Link } from "@tanstack/react-router"
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

/**
 * A signed change, coloured by direction.
 *
 * Not rendered at all when it is zero: a queue entry is only visible after a
 * game, and a game that moved neither rating nor position would otherwise
 * print a meaningless "+0" beside every figure.
 */
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

/**
 * Who is playing right now.
 *
 * Not a ladder, and the layout says so: no page numbers, no rank column, and
 * the ordering figure is *how long ago* rather than how high. The rows are the
 * players whose game count rose since the sampler last looked, so the list is
 * short by construction and empties itself — a rank would be a position in a
 * set that did not exist a minute ago.
 *
 * The chips are the same bracket/region pair the ladders use, because the queue
 * is addressed the same way and a reader arriving from a ladder page should not
 * have to learn a second control.
 *
 * The rows are a real `<table>` so the rank, the rating and the queue age are
 * each attached to the heading that names them — the deltas printed beside
 * those figures would otherwise have nothing to belong to.
 */
export const RankedQueueView = ({
    bracket,
    region,
    rows,
    now,
}: {
    readonly bracket: Ladder
    readonly region: Region
    readonly rows: readonly QueuedEntry[]
    /**
     * The render's clock, passed in rather than read here.
     *
     * "4m ago" is a function of two times, and reading `Date.now()` inside the
     * render makes the output depend on when React happened to run it — which
     * differs between the server pass and the hydration pass, producing a
     * mismatch on a figure that is only ever decorative.
     */
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

        {/*
         * Two named landmarks, the same pair the ladder pages use: the queue is
         * addressed the same way, so it should be navigable the same way too.
         */}
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
                        option.value === region ? "ch-chip-on" : "ch-chip-off",
                    )}
                >
                    {option.label}
                </Link>
            ))}
        </nav>

        {rows.length === 0 ? (
            <Empty className="mt-4 bg-card py-10">
                <EmptyHeader>
                    <EmptyDescription>
                        Nobody has queued on this ladder in the last 30 minutes.
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        ) : (
            <div className="mt-4 overflow-hidden bg-card">
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
                                    {/*
                                     * A pre-change row has no rank until its
                                     * first event after the migration, and the
                                     * column's placeholder for that is 0 — which
                                     * is not a position, so it prints as an
                                     * unknown rather than as "#0".
                                     */}
                                    <span className="font-bold tabular-nums">
                                        {row.rank === 0 ? "—" : row.rank}
                                    </span>
                                    {/*
                                     * Places, not positions. `rankDelta` is
                                     * literally new minus old, so a *climb* is
                                     * negative — which reads as a loss if shown
                                     * raw. Negating it here makes the sign mean
                                     * what a reader assumes: up is positive,
                                     * and green.
                                     */}
                                    <Delta value={-row.rankDelta} />
                                </TableCell>
                                <TableCell>
                                    {/*
                                     * One name for a solo ladder, two for a
                                     * team — the same "A & B" shape the 2v2
                                     * ladder row uses, so an entry reads the
                                     * same here as where it came from.
                                     */}
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
                                                    href={playerHref(member.id)}
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
            </div>
        )}

        <PageNav />
    </div>
)

/** Where a queue page lives. Bracket and region are both path segments. */
export const queueHref = (bracket: Ladder, region: Region): string =>
    region === "all"
        ? `/rankings/queues/${bracket}`
        : `/rankings/queues/${bracket}/${region}`

/**
 * How long ago, coarsely.
 *
 * Coarse on purpose: the sampler runs every ten minutes, so a minute-level
 * figure would imply a precision the data does not have — "4m ago" reads as
 * knowledge of the last four minutes, when all we know is that the game count
 * rose at some point since the previous sample.
 */
const since = (queuedAt: number, now: number): string => {
    const minutes = Math.max(0, Math.round((now - queuedAt) / 60_000))

    if (minutes < 1) return "just now"
    if (minutes === 1) return "1m ago"
    if (minutes < 60) return `${minutes}m ago`

    return `${Math.floor(minutes / 60)}h ago`
}
