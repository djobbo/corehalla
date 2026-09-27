import { createFileRoute } from "@tanstack/react-router"
import { LadderView } from "@/components/LadderView"
import { LADDER_PAGE_SIZE } from "@/lib/rankings"
import { to2v2Rows } from "@/lib/ladderRows"
import { resolvePage, resolveRegion } from "@/lib/routeParams"
import { preloadAtoms, rankings2v2Atom, useQuery } from "@/effect/atoms"

/** The 2v2 ladder. Same view as 1v1; a row is a team of two. */
export const Route = createFileRoute("/rankings/2v2/{-$region}/{-$page}")({
    loader: ({ params, context }) =>
        preloadAtoms(context, [
            rankings2v2Atom(
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
    const rows = to2v2Rows(useQuery(rankings2v2Atom(region, page)))

    return (
        <main className="ch-page">
            <LadderView
                bracket="2v2"
                region={region}
                page={page}
                rows={rows}
                hasNextPage={rows.length >= LADDER_PAGE_SIZE}
            />
        </main>
    )
}
