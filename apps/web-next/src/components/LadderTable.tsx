import { EntityLink } from "./EntityLink"
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
 * Rows are whole-row targets: the anchor spans the row rather than sitting on
 * the name, because a name is a few characters wide on a phone and tapping it
 * is a precision task. Rank and tier are the two places colour is allowed to
 * speak — the rank badge for the podium, the tier chip for the ladder's own
 * ramp.
 */
export const LadderTable = ({
    rows,
    className,
}: {
    readonly rows: readonly LadderRow[]
    readonly className?: string
}) => (
    <div className={cn("ch-panel overflow-hidden", className)}>
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
)
