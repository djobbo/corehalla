import { Link } from "@tanstack/react-router"
import { EntityLink } from "./EntityLink"
import {
    brackets,
    ladderHref,
    playerHref,
    regionLabel,
    regions,
    tierColor,
} from "@/lib/rankings"
import { cn } from "@/lib/cn"
import type { LadderRow } from "@/lib/ladderRows"
import type { Bracket } from "@/lib/rankings"
import type { RankedRegion } from "@crh/api-contract/schemas"
import type { CSSProperties } from "react"

/** The schema is a value; its decoded type is `Type`. */
type Region = typeof RankedRegion.Type

/**
 * A ranked ladder: the filter row plus the table.
 *
 * Both axes are one tap each, which is the whole point — the app this replaces
 * puts the same choice behind two dropdowns holding ten and five options, so
 * changing ladder and region cost four taps. The filter row is sticky because
 * the ladder is a surface to scroll, and losing the controls off the top turns
 * every change into a scroll back up first. It docks at `top-14`, directly under
 * the pinned masthead, so the two read as one fixed header.
 *
 * Rows are whole-row targets: the anchor spans the row rather than sitting on
 * the name, because a name is a few characters wide on a phone and tapping it is
 * a precision task. The legend/rating columns are inside the same target.
 *
 * Visually this is where the poster language does the most work: the filters are
 * parallelograms, the table is one outlined slab, and rank and tier are the two
 * places colour is allowed to speak.
 */
export type LadderViewProps = {
    readonly bracket: Bracket
    readonly region: Region
    readonly page: number
    readonly rows: readonly LadderRow[]
    /** Whether a next page exists, from the row count of this one. */
    readonly hasNextPage: boolean
}

export const LadderView = ({
    bracket,
    region,
    page,
    rows,
    hasNextPage,
}: LadderViewProps) => {
    return (
        <div>
            {/*
             * One short title band, not a hero: it gives every ladder page an
             * `h1` and the view its titleplate without pushing the first row of
             * ranks any further down than a heading would have anyway.
             */}
            <header className="ch-hero mb-3">
                <p className="ch-kicker">Live ladder</p>
                <h1 className="ch-display mt-1 text-2xl">
                    {bracket} rankings
                </h1>
                <p className="mt-1 text-xs text-textVar1">
                    {regionLabel(region)} · page {page}
                </p>
            </header>

            <div className="sticky top-14 z-20 -mx-4 bg-bgVar1/95 px-4 py-2 shadow-[0_3px_0_0_var(--color-ink)] backdrop-blur">
                <div className="flex flex-wrap gap-1.5">
                    {brackets.map((option) => (
                        <Link
                            key={option}
                            to={ladderHref(option, region, page)}
                            className={cn(
                                "ch-chip",
                                option === bracket
                                    ? "ch-chip-on"
                                    : "ch-chip-off",
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
                            to={ladderHref(bracket, option.value, 1)}
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
                </div>
            </div>

            <p className="mt-3 text-[0.66rem] font-bold uppercase tracking-[0.16em] text-textVar1">
                {rows.length} rows
            </p>

            <div className="ch-panel mt-2 overflow-hidden">
                <div className="ch-table-head">
                    <span className="w-7 shrink-0">#</span>
                    <span className="flex-1">Player</span>
                    <span className="w-14 shrink-0 text-right">Rating</span>
                    <span className="w-24 shrink-0 text-right">Tier</span>
                </div>

                {rows.map((row) => (
                    <div key={row.key} className="ch-row">
                        <span
                            className={cn(
                                "ch-rank",
                                row.rank <= 3 && `ch-rank-${row.rank}`,
                            )}
                        >
                            <span>{row.rank}</span>
                        </span>
                        {/* The whole row is the target. */}
                        <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-0.5">
                            {row.members.map((member) => (
                                <EntityLink
                                    key={member.id}
                                    type="player"
                                    id={member.id}
                                    href={playerHref(member.id)}
                                    className="ch-link font-semibold"
                                >
                                    {member.name}
                                </EntityLink>
                            ))}
                        </span>
                        <span className="ch-rating w-14 shrink-0 text-right">
                            {row.rating}
                        </span>
                        <span className="w-24 shrink-0 text-right">
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
                        </span>
                    </div>
                ))}
            </div>

            <div className="mt-4 flex gap-2">
                {page > 1 && (
                    <Link
                        to={ladderHref(bracket, region, page - 1)}
                        className="ch-btn"
                    >
                        ← Previous
                    </Link>
                )}
                {hasNextPage && (
                    <Link
                        to={ladderHref(bracket, region, page + 1)}
                        className="ch-btn"
                    >
                        Next →
                    </Link>
                )}
            </div>
        </div>
    )
}
