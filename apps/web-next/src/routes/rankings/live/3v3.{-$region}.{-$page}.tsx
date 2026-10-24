import { ClientOnly, createFileRoute } from "@tanstack/react-router"
import { PageLoaderProbe } from "@/components/layout/PageLoader"
import { LadderView } from "@/components/views/LadderView"
import { LADDER_PAGE_SIZE } from "@/lib/rankings"
import { to3v3Rows } from "@/lib/ladderRows"
import { resolvePage, resolveRegion } from "@/lib/routeParams"
import {
    preloadAtomsDegraded,
    rankings3v3Atom,
    rankings3v3QueryAtom,
    useQuery,
} from "@/effect/atoms"

export const Route = createFileRoute("/rankings/live/3v3/{-$region}/{-$page}")({
    loader: ({ params, context }) =>
        preloadAtomsDegraded(context, [
            rankings3v3QueryAtom(
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
    const board = useQuery(rankings3v3Atom(region, page))
    const rows = to3v3Rows(board)

    return (
        <main className="ch-page">
            <LadderView
                bracket="3v3"
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
