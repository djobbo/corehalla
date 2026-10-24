import {
    ClientOnly,
    createFileRoute,
    useNavigate,
} from "@tanstack/react-router"
import { PageLoaderProbe } from "@/components/layout/PageLoader"
import { PowerRankingsView } from "@/components/views/PowerRankingsView"
import {
    resolvePage,
    resolvePowerGameMode,
    resolvePowerOrderBy,
    resolvePowerRegion,
} from "@/lib/routeParams"
import {
    powerRankingsAtom,
    powerRankingsQueryAtom,
    preloadAtomsDegraded,
    useQuery,
} from "@/effect/atoms"
import type { PowerRankingsOrderBy } from "@crh/api-contract/schemas"

type PowerSearch = { orderBy: PowerRankingsOrderBy }

export const Route = createFileRoute(
    "/rankings/power/{-$gameMode}/{-$region}/{-$page}",
)({
    validateSearch: (search: Record<string, unknown>): PowerSearch => ({
        orderBy: resolvePowerOrderBy(search.orderBy),
    }),
    loaderDeps: ({ search }) => ({ orderBy: search.orderBy }),
    loader: ({ params, deps, context }) =>
        preloadAtomsDegraded(context, [
            powerRankingsQueryAtom(
                resolvePowerGameMode(params.gameMode),
                resolvePowerRegion(params.region),
                resolvePage(params.page),
                deps.orderBy,
            ),
        ]),
    component: Page,
})

function PageContent() {
    const {
        gameMode: gameModeParam,
        region: regionParam,
        page: pageParam,
    } = Route.useParams()
    const { orderBy } = Route.useSearch()
    const navigate = useNavigate()

    const gameMode = resolvePowerGameMode(gameModeParam)
    const region = resolvePowerRegion(regionParam)
    const page = resolvePage(pageParam)
    const board = useQuery(powerRankingsAtom(gameMode, region, page, orderBy))

    return (
        <main className="ch-page">
            <PowerRankingsView
                gameMode={gameMode}
                region={region}
                page={page}
                orderBy={orderBy}
                players={board.data}
                totalPages={board.meta.total_pages}
                updatedAt={board.meta.updated_at}
                onOrderByChange={(next) =>
                    // A new sort reorders the whole board, so start at page 1.
                    void navigate({
                        to: "/rankings/power/{-$gameMode}/{-$region}/{-$page}",
                        params: { gameMode, region, page: undefined },
                        search: { orderBy: next },
                        replace: true,
                    })
                }
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
