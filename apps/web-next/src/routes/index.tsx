import { createFileRoute } from "@tanstack/react-router"
import { LadderView } from "@/components/LadderView"
import { LADDER_PAGE_SIZE } from "@/lib/rankings"
import { to1v1Rows } from "@/lib/ladderRows"
import { preloadAtoms, rankings1v1Atom, useQuery } from "@/effect/atoms"

/**
 * The home page is the leaderboard.
 *
 * That is the single biggest action-budget decision in the design: browsing the
 * rankings costs **zero** actions instead of one, because the live table is what
 * loads rather than something you navigate to. The hero is therefore one line —
 * a wordmark and the search affordance — and hands the rest of the viewport to
 * the table.
 *
 * Favorites and news sit below the ladder rather than above it, for the same
 * reason: anything placed first delays the first row of ranks.
 */
export const Route = createFileRoute("/")({
    loader: ({ context }) =>
        preloadAtoms(context, [rankings1v1Atom("all", 1)]),
    component: Page,
})

function Page() {
    const rows = to1v1Rows(useQuery(rankings1v1Atom("all", 1)))

    return (
        <main className="p-4">
            <LadderView
                bracket="1v1"
                region="all"
                page={1}
                rows={rows}
                hasNextPage={rows.length >= LADDER_PAGE_SIZE}
            />
        </main>
    )
}
