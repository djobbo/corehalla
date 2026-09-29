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

type LegendRankingsSearch = { sortBy: SortableLegendProp }

export const Route = createFileRoute(
    "/rankings/career/legends/{-$legendId}/{-$page}",
)({
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
            <fieldset className="mt-6 min-w-0">
                <legend className="ch-stat-label">Legend</legend>
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
