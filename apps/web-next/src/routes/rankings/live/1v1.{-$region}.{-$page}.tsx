import { ClientOnly, createFileRoute } from "@tanstack/react-router"
import { PageLoaderProbe } from "@/components/layout/PageLoader"
import { LadderView } from "@/components/views/LadderView"
import { LADDER_PAGE_SIZE } from "@/lib/rankings"
import { to1v1Rows } from "@/lib/ladderRows"
import {
    resolvePage,
    resolvePlayerFilter,
    resolveRegion,
} from "@/lib/routeParams"
import {
    preloadAtomsDegraded,
    rankings1v1Atom,
    rankings1v1QueryAtom,
    useQuery,
} from "@/effect/atoms"

type LadderSearch = { player?: string }

export const Route = createFileRoute("/rankings/live/1v1/{-$region}/{-$page}")({
    // The filter lives in the URL, so a filtered board is shareable and a cold
    // load of it can be server-rendered from the same key the client hydrates.
    validateSearch: (search: Record<string, unknown>): LadderSearch => ({
        player: resolvePlayerFilter(search.player),
    }),
    loaderDeps: ({ search }) => ({ player: search.player }),
    loader: ({ params, deps, context }) =>
        preloadAtomsDegraded(context, [
            rankings1v1QueryAtom(
                resolveRegion(params.region),
                resolvePage(params.page),
                deps.player,
            ),
        ]),
    component: Page,
})

function PageContent() {
    const { region: regionParam, page: pageParam } = Route.useParams()
    const { player } = Route.useSearch()

    const region = resolveRegion(regionParam)
    const page = resolvePage(pageParam)
    const board = useQuery(rankings1v1Atom(region, page, player))
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
                player={player}
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
