import { createFileRoute } from "@tanstack/react-router"
import { LadderView } from "@/components/LadderView"
import { LADDER_PAGE_SIZE } from "@/lib/rankings"
import { to3v3Rows } from "@/lib/ladderRows"
import { resolvePage, resolveRegion } from "@/lib/routeParams"
import { preloadAtoms, rankings3v3Atom, useQuery } from "@/effect/atoms"

/**
 * The 3v3 ladder.
 *
 * v1-only — the legacy API exposes no 3v3 mode, so unlike 1v1 and 2v2 this
 * ladder has no fallback source. An incomplete v1 response therefore shows as an
 * empty table rather than being filled from v0; there is no v0 answer to give.
 */
export const Route = createFileRoute("/rankings/3v3/{-$region}/{-$page}")({
    loader: ({ params, context }) =>
        preloadAtoms(context, [
            rankings3v3Atom(
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
    const rows = to3v3Rows(useQuery(rankings3v3Atom(region, page)))

    return (
        <main className="ch-page">
            <LadderView
                bracket="3v3"
                region={region}
                page={page}
                rows={rows}
                hasNextPage={rows.length >= LADDER_PAGE_SIZE}
            />
        </main>
    )
}
