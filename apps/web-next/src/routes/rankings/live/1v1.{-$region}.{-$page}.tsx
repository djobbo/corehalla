import { ClientOnly, createFileRoute } from "@tanstack/react-router"
import { PageLoaderProbe } from "@/components/layout/PageLoader"
import { LadderView } from "@/components/views/LadderView"
import { LADDER_PAGE_SIZE } from "@/lib/rankings"
import { to1v1Rows } from "@/lib/ladderRows"
import { resolvePage, resolveRegion } from "@/lib/routeParams"
import {
    preloadAtomsDegraded,
    rankings1v1Atom,
    rankings1v1QueryAtom,
    useQuery,
} from "@/effect/atoms"

export const Route = createFileRoute("/rankings/live/1v1/{-$region}/{-$page}")({
    loader: ({ params, context }) =>
        preloadAtomsDegraded(context, [
            rankings1v1QueryAtom(
                resolveRegion(params.region),
                resolvePage(params.page),
            ),
        ]),
    component: Page,
})

function PageContent() {
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

const BoardShell = () => (
    <main className="ch-page">
        <PageLoaderProbe />
    </main>
)

function Page() {
    const { degraded } = Route.useLoaderData()

    if (degraded) {
        return (
            <ClientOnly fallback={<BoardShell />}>
                <PageContent />
            </ClientOnly>
        )
    }

    return <PageContent />
}
