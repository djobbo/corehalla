import { createFileRoute } from "@tanstack/react-router"
import { LadderView } from "@/components/views/LadderView"
import { LADDER_PAGE_SIZE } from "@/lib/rankings"
import { to1v1Rows } from "@/lib/ladderRows"
import { resolvePage, resolveRegion } from "@/lib/routeParams"
import { preloadAtoms, rankings1v1Atom, useQuery } from "@/effect/atoms"

export const Route = createFileRoute("/rankings/live/1v1/{-$region}/{-$page}")({
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
    const board = useQuery(rankings1v1Atom(region, page))
    const rows = to1v1Rows(board)

    return (
        <main className="ch-page">
            <LadderView
                bracket="1v1"
                region={region}
                page={page}
                rows={rows}
                hasNextPage={rows.length >= LADDER_PAGE_SIZE}
                updatedAt={board.meta.updated_at}
            />
        </main>
    )
}
