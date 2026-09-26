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
            <header className="flex items-center gap-3">
                <h1 className="text-lg font-bold">Corehalla</h1>
                {/*
                 * Inert until the lookup overlay lands: the design routes this
                 * control to a search surface that does not exist yet, and
                 * wiring it to the in-table `?q=` filter instead would be a
                 * different interaction wearing the same label.
                 */}
                <button
                    type="button"
                    data-lookup-trigger
                    className="flex-1 rounded border border-bg bg-bg px-2 py-1 text-left text-sm text-textVar1"
                >
                    Search players and clans
                </button>
            </header>

            <div className="mt-4">
                <LadderView
                    bracket="1v1"
                    region="all"
                    page={1}
                    rows={rows}
                    hasNextPage={rows.length >= LADDER_PAGE_SIZE}
                />
            </div>
        </main>
    )
}
