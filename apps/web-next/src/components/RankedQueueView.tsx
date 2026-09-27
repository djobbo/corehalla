import { Link } from "@tanstack/react-router"
import { EntityLink } from "./EntityLink"
import { PageNav } from "@/components/ui/PageNav"
import {
    brackets,
    playerHref,
    regionLabel,
    regions,
    tierColor,
} from "@/lib/rankings"
import { cn } from "@/lib/cn"
import { cleanString } from "@crh/common/helpers/cleanString"
import type { QueuedPlayer } from "@crh/api-contract/schemas"
import type { Ladder } from "@crh/api-contract/schemas"
import type { RankedRegion } from "@crh/api-contract/schemas"
import type { CSSProperties } from "react"

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
 */
export const RankedQueueView = ({
    bracket,
    region,
    rows,
    now,
}: {
    readonly bracket: Ladder
    readonly region: Region
    readonly rows: readonly QueuedPlayer[]
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
            <p className="mt-1 text-xs text-textVar1">
                {bracket} · {regionLabel(region)} · {rows.length} playing in the
                last 30 minutes
            </p>
        </header>

        <div className="flex flex-wrap gap-1.5">
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
        </div>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
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
        </div>

        {rows.length === 0 ? (
            <p className="ch-panel mt-4 px-4 py-10 text-center text-sm text-textVar1">
                Nobody has queued on this ladder in the last 30 minutes.
            </p>
        ) : (
            <div className="ch-panel mt-4 overflow-hidden">
                <div className="ch-table-head">
                    <span className="flex-1">Player</span>
                    <span className="w-16 shrink-0 text-right">Rating</span>
                    <span className="w-24 shrink-0 text-right">Tier</span>
                    <span className="w-20 shrink-0 text-right">Queued</span>
                </div>

                {rows.map((row) => (
                    <div key={row.id} className="ch-row">
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
                        <span className="ch-rating w-16 shrink-0 text-right">
                            {row.rating}
                        </span>
                        <span className="w-24 shrink-0 text-right">
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
                        <span className="w-20 shrink-0 text-right text-xs text-textVar1">
                            {now === 0 ? "" : since(row.queuedAt, now)}
                        </span>
                    </div>
                ))}
            </div>
        )}

        <PageNav />
    </div>
)

/** Where a queue page lives. Bracket and region are both path segments. */
export const queueHref = (bracket: Ladder, region: Region): string =>
    region === "all" ? `/queue/${bracket}` : `/queue/${bracket}/${region}`

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
