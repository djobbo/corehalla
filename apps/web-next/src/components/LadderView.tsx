import { Link } from "@tanstack/react-router"
import { EntityLink } from "./EntityLink"
import { brackets, ladderHref, playerHref, regionLabel, regions } from "@/lib/rankings"
import { cn } from "@/lib/cn"
import type { LadderRow } from "@/lib/ladderRows"
import type { Bracket } from "@/lib/rankings"
import type { RankedRegion } from "@crh/api-contract/schemas"

/** The schema is a value; its decoded type is `Type`. */
type Region = typeof RankedRegion.Type

/**
 * A ranked ladder: the filter row plus the table.
 *
 * Both axes are one tap each, which is the whole point — the app this replaces
 * puts the same choice behind two dropdowns holding ten and five options, so
 * changing ladder and region cost four taps. The filter row is sticky because
 * the ladder is a surface to scroll, and losing the controls off the top turns
 * every change into a scroll back up first.
 *
 * Rows are whole-row targets: the anchor spans the row rather than sitting on
 * the name, because a name is a few characters wide on a phone and tapping it is
 * a precision task. The legend/rating columns are inside the same target.
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
            <div className="sticky top-0 z-10 border-b border-bg bg-bgVar1 py-2">
                <div className="flex flex-wrap gap-1">
                    {brackets.map((option) => (
                        <Link
                            key={option}
                            to={ladderHref(option, region, page)}
                            className={cn(
                                "rounded px-2 py-1 text-sm",
                                option === bracket
                                    ? "bg-accent text-text"
                                    : "bg-bg text-textVar1",
                            )}
                        >
                            {option}
                        </Link>
                    ))}
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                    {regions.map((option) => (
                        <Link
                            key={option.value}
                            to={ladderHref(bracket, option.value, 1)}
                            className={cn(
                                "rounded px-2 py-1 text-xs",
                                option.value === region
                                    ? "bg-accent text-text"
                                    : "bg-bg text-textVar1",
                            )}
                        >
                            {option.label}
                        </Link>
                    ))}
                </div>
            </div>

            <p className="mt-3 text-xs text-textVar1">
                {bracket} · {regionLabel(region)} · page {page} · {rows.length}{" "}
                rows
            </p>

            <div className="mt-2 flex flex-col">
                {rows.map((row) => (
                    <div
                        key={row.key}
                        className="flex items-center gap-3 border-b border-bg py-2"
                    >
                        <span className="w-10 shrink-0 text-right text-xs text-textVar1">
                            {row.rank}
                        </span>
                        {/* The whole row is the target. */}
                        {row.members.map((member) => (
                            <EntityLink
                                key={member.id}
                                type="player"
                                id={member.id}
                                href={playerHref(member.id)}
                                className="flex flex-1 items-center gap-2"
                            >
                                <span>{member.name}</span>
                            </EntityLink>
                        ))}
                        <span className="shrink-0 text-sm">{row.rating}</span>
                        <span className="w-20 shrink-0 text-right text-xs text-textVar1">
                            {row.tier}
                        </span>
                    </div>
                ))}
            </div>

            <div className="mt-4 flex gap-2 text-sm">
                {page > 1 && (
                    <Link to={ladderHref(bracket, region, page - 1)}>
                        ← Previous
                    </Link>
                )}
                {hasNextPage && (
                    <Link to={ladderHref(bracket, region, page + 1)}>
                        Next →
                    </Link>
                )}
            </div>
        </div>
    )
}
