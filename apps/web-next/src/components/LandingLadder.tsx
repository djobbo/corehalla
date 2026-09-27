import { Link } from "@tanstack/react-router"
import { LadderTable } from "./LadderTable"
import { ladderHref } from "@/lib/rankings"
import type { Bracket } from "@/lib/rankings"
import type { LadderRow } from "@/lib/ladderRows"

/** How many ranks a preview shows before handing off to the full ladder. */
const PREVIEW_ROWS = 5

/**
 * One bracket's top ranks, as a landing-page column.
 *
 * The landing shows two of these side by side, so the component is the *unit*
 * the landing repeats rather than a one-off: the bracket, its slice of rows,
 * and the way out of the preview are decided together, and a third ladder would
 * be one more line in the route rather than a third copy of this markup.
 *
 * A landing page that showed all fifty rows would not be a landing page — it
 * would be the ladder with worse controls, dragging the filter bar and the page
 * buttons along with it, and meeting a visitor with a wall of ranks they did
 * not ask for. Five establishes that the numbers are real and moving; the sixth
 * is the ladder page's job, and the button is how you get there.
 *
 * The button is pushed to the bottom with `mt-auto`, so the two columns' buttons
 * line up even when one bracket's team names wrap and the other's do not.
 */
export const LandingLadder = ({
    bracket,
    rows,
}: {
    readonly bracket: Bracket
    readonly rows: readonly LadderRow[]
}) => {
    const preview = rows.slice(0, PREVIEW_ROWS)
    const hasMore = rows.length > preview.length

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
                {/*
                 * An `h2`, not an `h3`: the landing's section heading used to
                 * sit above these, and with it gone these are the first
                 * headings under the page's `h1` — an `h3` here would skip a
                 * level in the outline.
                 */}
                <h2 className="ch-display text-lg">{bracket}</h2>
            </div>

            {preview.length === 0 ? (
                /*
                 * Reachable: the 2v2 ladder is v1-first with a v0 fallback, and
                 * v0 needs a key — so a ladder can come back genuinely empty
                 * rather than merely short. A header row with nothing under it
                 * reads as a loading state that never finished, so it says so
                 * instead.
                 */
                <p className="ch-panel px-4 py-6 text-center text-xs text-textVar1">
                    The {bracket} ladder could not be read right now.
                </p>
            ) : (
                <LadderTable rows={preview} />
            )}

            {hasMore ? (
                <Link
                    to={ladderHref(bracket, "all")}
                    // Two "Load more" links on one page need to be told apart
                    // by name as well as by position.
                    aria-label={`Load more ${bracket} rankings`}
                    className="ch-btn mt-auto w-full justify-center py-3"
                >
                    Load more
                </Link>
            ) : null}
        </div>
    )
}
