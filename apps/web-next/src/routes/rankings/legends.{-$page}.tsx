import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { GlobalRankingsView } from "@/components/GlobalRankingsView"
import { GLOBAL_RANKINGS_PAGE_SIZE } from "@/lib/rankings"
import { legendBoard } from "@/lib/globalRankings"
import { legendOptions, resolveLegendId, resolvePage } from "@/lib/routeParams"
import { cn } from "@/lib/cn"
import {
    globalLegendRankingsAtom,
    preloadAtoms,
    useQuery,
} from "@/effect/atoms"
import { legendsMap } from "@crh/bhapi/legends"
import type { SortableLegendProp } from "@crh/api-contract/schemas"

/**
 * One legend's leaderboard: who has played them the most, and how well.
 *
 * The legend is a search param rather than a path segment, unlike the ladder's
 * region, because there are around seventy of them and most are visited by
 * picking rather than by linking. Anything shareable still is — the legend and
 * the column are both in the URL, so a link to "most KOs with Bodvar" works.
 *
 * The numbers are that legend's own, not the player's career figures filtered
 * down: `BHPlayerLegend` is keyed by (player, legend), and the query sorts its
 * columns. So "12,345 games" here means games *with this legend*.
 */

type LegendRankingsSearch = { legend: string; sortBy: SortableLegendProp }

export const Route = createFileRoute("/rankings/legends/{-$page}")({
    validateSearch: (
        search: Record<string, unknown>,
    ): LegendRankingsSearch => ({
        legend: String(resolveLegendId(search.legend)),
        sortBy: legendBoard.sort(search.sortBy),
    }),
    loaderDeps: ({ search }) => ({
        legendId: Number(search.legend),
        sortBy: search.sortBy,
    }),
    loader: ({ params, deps, context }) =>
        preloadAtoms(context, [
            globalLegendRankingsAtom(
                deps.legendId,
                deps.sortBy,
                resolvePage(params.page),
            ),
        ]),
    component: Page,
})

function Page() {
    const { page: pageParam } = Route.useParams()
    const { legend, sortBy } = Route.useSearch()
    const navigate = useNavigate()

    const page = resolvePage(pageParam)
    const legendId = Number(legend)
    const rows = useQuery(globalLegendRankingsAtom(legendId, sortBy, page))

    const pageHref = (next: number) => {
        const query = `legend=${legend}&sortBy=${sortBy}`

        return next > 1
            ? `/rankings/legends/${next}?${query}`
            : `/rankings/legends?${query}`
    }

    const go = (search: LegendRankingsSearch) =>
        void navigate({
            to: "/rankings/legends/{-$page}",
            params: { page: undefined },
            search,
            replace: true,
        })

    return (
        <main className="ch-page">
            <header className="ch-hero mb-3">
                <p className="ch-kicker">Per legend</p>
                <h1 className="ch-display mt-1 text-2xl">
                    {legendsMap[legendId]?.bio_name ?? "Legend"} rankings
                </h1>
                <p className="mt-1 text-xs text-muted-foreground">
                    Totals with this legend · page {page}
                </p>
            </header>

            <GlobalRankingsView
                rows={rows}
                sortBy={sortBy}
                sorts={legendBoard.sorts}
                onSortChange={(next) => go({ legend, sortBy: next })}
                metric={legendBoard.option(sortBy)}
                rankOffset={(page - 1) * GLOBAL_RANKINGS_PAGE_SIZE}
                prevHref={page > 1 ? pageHref(page - 1) : undefined}
                nextHref={
                    rows.length >= GLOBAL_RANKINGS_PAGE_SIZE
                        ? pageHref(page + 1)
                        : undefined
                }
            />

            {/*
             * The legend picker sits below the board rather than above it, so
             * the page opens on data instead of on a control. It is the same
             * `ch-chip` row the ladder uses for its axes — the app already had
             * a way to say "choose one of a set", and seventy options in a
             * `<select>` would be worse to use than a wrapping chip row.
             */}
            <fieldset className="mt-6 min-w-0">
                <legend className="ch-stat-label">Legend</legend>
                {/*
                 * A `fieldset`, not a bare flex row: the chips are the one
                 * "choose a legend" control, and `legend` is the native way to
                 * name it — so a screen reader announces the question when it
                 * lands on the first of seventy buttons. `min-w-0` undoes the
                 * fieldset's default minimum content width, which would
                 * otherwise stop the row from wrapping.
                 */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                    {legendOptions.map((option) => {
                        const current = option.value === legend

                        return (
                            <button
                                key={option.value}
                                type="button"
                                aria-pressed={current}
                                onClick={() =>
                                    go({ legend: option.value, sortBy })
                                }
                                className={cn(
                                    "ch-chip",
                                    current ? "ch-chip-on" : "ch-chip-off",
                                )}
                            >
                                {option.label}
                            </button>
                        )
                    })}
                </div>
            </fieldset>
        </main>
    )
}
