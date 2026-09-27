import { Link } from "@tanstack/react-router"

/**
 * Previous/next controls for a paged list.
 *
 * Extracted once a third list needed them. The ladder, the global leaderboards
 * and the clan rankings are all "one page of many", and three hand-written
 * copies of the same two buttons would eventually disagree about which end
 * disappears when — or about whether the first page offers a "previous" at all.
 *
 * Each control is a real link rather than a button with a handler, so a page of
 * a ranking stays shareable, middle-clickable and back-buttonable. `undefined`
 * means the end is not reachable, which is also how the caller says "there is
 * nothing that way" without the component having to know about page counts.
 */
export const PageNav = ({
    prevHref,
    nextHref,
}: {
    readonly prevHref?: string | undefined
    readonly nextHref?: string | undefined
}) => (
    <div className="mt-4 flex gap-2">
        {prevHref === undefined ? null : (
            <Link to={prevHref} className="ch-btn">
                ← Previous
            </Link>
        )}
        {nextHref === undefined ? null : (
            <Link to={nextHref} className="ch-btn">
                Next →
            </Link>
        )}
    </div>
)
