import { ClientOnly, createFileRoute } from "@tanstack/react-router"
import { PageLoaderProbe } from "@/components/layout/PageLoader"
import { LadderView } from "@/components/views/LadderView"
import { LADDER_PAGE_SIZE, ladderHref, regionLabel } from "@/lib/rankings"
import { ladderTitle, seoTags } from "@/lib/seo"
import { to1v1Rows } from "@/lib/ladderRows"
import {
    parseLadderSearch,
    resolvePage,
    resolveRegion,
} from "@/lib/routeParams"
import {
    preloadAtomsDegraded,
    rankings1v1Atom,
    rankings1v1QueryAtom,
    useQuery,
} from "@/effect/atoms"

export const Route = createFileRoute("/rankings/live/1v1/{-$region}/{-$page}")({
    // The filter lives in the URL, so a filtered board is shareable and a cold
    // load of it can be server-rendered from the same key the client hydrates.
    validateSearch: parseLadderSearch,
    loaderDeps: ({ search }) => ({ player: search.player }),
    loader: ({ params, deps, context }) =>
        preloadAtomsDegraded(context, [
            rankings1v1QueryAtom(
                resolveRegion(params.region),
                resolvePage(params.page),
                deps.player,
            ),
        ]),
    head({ params }) {
        const region = resolveRegion(params.region)
        const page = resolvePage(params.page)

        return seoTags({
            title: ladderTitle("1v1", region, page),
            description: `Live 1v1 ranked ladder — ${regionLabel(region)}, page ${page}. Ratings, wins and the legends each player favours.`,
            path: ladderHref("1v1", region, page),
        })
    },
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
        <main id="main" tabIndex={-1} className="ch-page">
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
    <main id="main" tabIndex={-1} className="ch-page">
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
