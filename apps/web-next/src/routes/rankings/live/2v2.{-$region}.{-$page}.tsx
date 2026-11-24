import { ClientOnly, createFileRoute } from "@tanstack/react-router"
import { PageLoaderProbe } from "@/components/layout/PageLoader"
import { LadderView } from "@/components/views/LadderView"
import { LADDER_PAGE_SIZE, ladderHref, regionLabel } from "@/lib/rankings"
import { ladderTitle, seoTags } from "@/lib/seo"
import { to2v2Rows } from "@/lib/ladderRows"
import { resolvePage, resolveRegion } from "@/lib/routeParams"
import {
    preloadAtomsDegraded,
    rankings2v2Atom,
    rankings2v2QueryAtom,
    useQuery,
} from "@/effect/atoms"

export const Route = createFileRoute("/rankings/live/2v2/{-$region}/{-$page}")({
    loader: ({ params, context }) =>
        preloadAtomsDegraded(context, [
            rankings2v2QueryAtom(
                resolveRegion(params.region),
                resolvePage(params.page),
            ),
        ]),
    head({ params }) {
        const region = resolveRegion(params.region)
        const page = resolvePage(params.page)

        return seoTags({
            title: ladderTitle("2v2", region, page),
            description: `Live 2v2 ranked ladder — ${regionLabel(region)}, page ${page}. Team ratings, wins and the pairs climbing fastest.`,
            path: ladderHref("2v2", region, page),
        })
    },
    component: Page,
})

function PageContent() {
    const { region: regionParam, page: pageParam } = Route.useParams()

    const region = resolveRegion(regionParam)
    const page = resolvePage(pageParam)
    const board = useQuery(rankings2v2Atom(region, page))
    const rows = to2v2Rows(board)

    return (
        <main className="ch-page">
            <LadderView
                bracket="2v2"
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
