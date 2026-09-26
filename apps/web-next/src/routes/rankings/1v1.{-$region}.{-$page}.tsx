import { createFileRoute } from "@tanstack/react-router"
import { LadderView } from "@/components/LadderView"
import { LADDER_PAGE_SIZE } from "@/lib/rankings"
import { to1v1Rows } from "@/lib/ladderRows"
import { resolvePage, resolveRegion } from "@/lib/routeParams"
import { preloadAtoms, rankings1v1Atom, useQuery } from "@/effect/atoms"

/**
 * The canonical 1v1 ladder URL.
 *
 * Home renders the same view without the region being in the path, so this route
 * is what a shared, indexable ladder link points at — the filter is part of the
 * address, not client state.
 */
export const Route = createFileRoute("/rankings/1v1/{-$region}/{-$page}")({
    loader: ({ params, context }) =>
        preloadAtoms(context, [
            rankings1v1Atom(
                resolveRegion(params.region),
                resolvePage(params.page),
            ),
        ]),
    component: Page,
})

function Page() {
    const { region: regionParam, page: pageParam } = Route.useParams()

    const region = resolveRegion(regionParam)
    const page = resolvePage(pageParam)
    const rows = to1v1Rows(useQuery(rankings1v1Atom(region, page)))

    return (
        <main className="p-4">
            <LadderView
                bracket="1v1"
                region={region}
                page={page}
                rows={rows}
                hasNextPage={rows.length >= LADDER_PAGE_SIZE}
            />
        </main>
    )
}
