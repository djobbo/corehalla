import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { CareerRankingsView } from "@/components/CareerRankingsView"
import { CAREER_RANKINGS_PAGE_SIZE } from "@/lib/rankings"
import { legendBoard } from "@/lib/careerRankings"
import { legendOptions, resolveLegendId, resolvePage } from "@/lib/routeParams"
import { cn } from "@/lib/cn"
import {
    careerLegendRankingsAtom,
    preloadAtoms,
    useQuery,
} from "@/effect/atoms"
import { legendsMap } from "@crh/bhapi/legends"
import type { SortableLegendProp } from "@crh/api-contract/schemas"

/**
 * One legend's leaderboard: who has played them the most, and how well.
 *
 * The legend is a path segment, so a board is a real address that can be linked,
 * bookmarked and indexed on its own: `/rankings/career/legends/3`. A bare
 * `/rankings/career/legends` resolves to the first legend rather than erroring,
 * the same call the region and page resolvers make, and the picker below writes
 * the explicit id.
 *
 * The numbers are that legend's own, not the player's career figures filtered
 * down: `BHPlayerLegend` is keyed by (player, legend), and the query sorts its
 * columns. So "12,345 games" here means games *with this legend*.
 */

type LegendRankingsSearch = { sortBy: SortableLegendProp }

export const Route = createFileRoute(
    "/rankings/career/legends/{-$legendId}/{-$page}",
)({
    // An unrecognised sort falls back to the board's default rather than
    // erroring, the same call `resolveRegion` makes for a mistyped region.
    validateSearch: (
        search: Record<string, unknown>,
    ): LegendRankingsSearch => ({
        sortBy: legendBoard.sort(search.sortBy),
    }),
    loaderDeps: ({ search }) => ({ sortBy: search.sortBy }),
    loader: ({ params, deps, context }) =>
        preloadAtoms(context, [
            careerLegendRankingsAtom(
                resolveLegendId(params.legendId),
                deps.sortBy,
                resolvePage(params.page),
            ),
        ]),
    component: Page,
})

function Page() {
    const { legendId: legendParam, page: pageParam } = Route.useParams()
    const { sortBy } = Route.useSearch()
    const navigate = useNavigate()

    const legendId = resolveLegendId(legendParam)
    const legend = String(legendId)
    const page = resolvePage(pageParam)
    const rows = useQuery(careerLegendRankingsAtom(legendId, sortBy, page))

    // The legend and the sort survive paging; the page segment only appears
    // past the first, which keeps `/rankings/career/legends/3` canonical.
    const pageHref = (next: number) =>
        (next > 1
            ? `/rankings/career/legends/${legend}/${next}`
            : `/rankings/career/legends/${legend}`) + `?sortBy=${sortBy}`

    const go = (legendId: number, sortBy: SortableLegendProp) =>
        void navigate({
            to: "/rankings/career/legends/{-$legendId}/{-$page}",
            params: { legendId: String(legendId), page: undefined },
            search: { sortBy },
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

            <CareerRankingsView
                rows={rows}
                sortBy={sortBy}
                sorts={legendBoard.sorts}
                onSortChange={(next) => go(legendId, next)}
                metric={legendBoard.option(sortBy)}
                rankOffset={(page - 1) * CAREER_RANKINGS_PAGE_SIZE}
                prevHref={page > 1 ? pageHref(page - 1) : undefined}
                nextHref={
                    rows.length >= CAREER_RANKINGS_PAGE_SIZE
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
                                onClick={() => go(Number(option.value), sortBy)}
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
