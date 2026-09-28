import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { CareerRankingsView } from "@/components/CareerRankingsView"
import { CAREER_RANKINGS_PAGE_SIZE } from "@/lib/rankings"
import { playerBoard } from "@/lib/careerRankings"
import { resolvePage } from "@/lib/routeParams"
import { careerRankingsAtom, preloadAtoms, useQuery } from "@/effect/atoms"
import type { SortablePlayerProp } from "@crh/api-contract/schemas"

/**
 * The career-totals leaderboards.
 *
 * Every column the archive holds for a player, one select away. The sort is a
 * search param rather than component state because the server orders by it:
 * changing it changes the request, so it belongs in the URL and in the loader's
 * dependencies — and a "top KO players" page stays a link.
 *
 * `players` is the default board of the `career` section, but it still owns a
 * named path: the three boards are siblings under `/rankings/career`, and a
 * bare `/rankings/career` is only a redirect to this one.
 */

type CareerSearch = { sortBy: SortablePlayerProp }

export const Route = createFileRoute("/rankings/career/players/{-$page}")({
    // An unrecognised sort falls back to the board's default rather than
    // erroring, the same call `resolveRegion` makes for a mistyped region.
    validateSearch: (search: Record<string, unknown>): CareerSearch => ({
        sortBy: playerBoard.sort(search.sortBy),
    }),
    loaderDeps: ({ search }) => ({ sortBy: search.sortBy }),
    loader: ({ params, deps, context }) =>
        preloadAtoms(context, [
            careerRankingsAtom(deps.sortBy, resolvePage(params.page)),
        ]),
    component: Page,
})

function Page() {
    const { page: pageParam } = Route.useParams()
    const { sortBy } = Route.useSearch()
    const navigate = useNavigate()

    const page = resolvePage(pageParam)
    const rows = useQuery(careerRankingsAtom(sortBy, page))

    // The sort survives paging; the page segment only appears past the first,
    // which keeps `/rankings/career/players` the canonical address of page one.
    const pageHref = (next: number) =>
        next > 1
            ? `/rankings/career/players/${next}?sortBy=${sortBy}`
            : `/rankings/career/players?sortBy=${sortBy}`

    return (
        <main className="ch-page">
            <header className="ch-hero mb-3">
                <p className="ch-kicker">Archive</p>
                <h1 className="ch-display mt-1 text-2xl">Career rankings</h1>
                <p className="mt-1 text-xs text-muted-foreground">
                    Career totals · page {page}
                </p>
            </header>

            <CareerRankingsView
                rows={rows}
                sortBy={sortBy}
                sorts={playerBoard.sorts}
                onSortChange={(next) =>
                    // Changing the column starts the board again: page four of
                    // "most games" is not page four of "most KOs", and the two
                    // do not even contain the same players.
                    void navigate({
                        to: "/rankings/career/players/{-$page}",
                        params: { page: undefined },
                        search: { sortBy: next },
                        replace: true,
                    })
                }
                metric={playerBoard.option(sortBy)}
                rankOffset={(page - 1) * CAREER_RANKINGS_PAGE_SIZE}
                prevHref={page > 1 ? pageHref(page - 1) : undefined}
                nextHref={
                    rows.length >= CAREER_RANKINGS_PAGE_SIZE
                        ? pageHref(page + 1)
                        : undefined
                }
            />
        </main>
    )
}
