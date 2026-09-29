import { createFileRoute, Outlet, notFound, redirect } from "@tanstack/react-router"
import { parseEntityId } from "@crh/common/helpers/entitySlug"
import { PlayerHeader } from "@/components/player/PlayerHeader"
import { PlayerTabs } from "@/components/player/PlayerTabs"
import {
    dehydrateRegistry,
    playerProfileAtom,
    preloadAtom,
    useQuery,
} from "@/effect/atoms"
import type { PlayerEnvelope } from "@crh/api-contract/schemas"

/**
 * A player's profile page.
 *
 * The layout owns the header and the tab strip; each tab is a real child route,
 * so `/stats/players/123-bomber/legends` is a page you can link, share and reload
 * rather than a mode of a page. That split is also what keeps the header from
 * re-rendering when a tab changes.
 *
 * ## One request, and a canonical URL
 *
 * The loader preloads the single profile aggregate — the four atoms this used to
 * read are gone. It also normalises the URL: the route segment is a slug of the
 * form `123-name`, and a request whose name half is stale (or absent) is
 * redirected to the one the API reports. That is what makes a profile link
 * survive a rename instead of quietly resolving to the old page.
 */
export const Route = createFileRoute("/stats/players/$id")({
    async loader({ params, context }) {
        const playerId = parseEntityId(params.id)

        if (playerId === null) {
            throw notFound()
        }

        let envelope: PlayerEnvelope

        try {
            envelope = (await preloadAtom(
                context.registry,
                playerProfileAtom(playerId),
            )) as PlayerEnvelope
        } catch {
            /*
             * The aggregate answers 404 for a player nobody knows, and the
             * registry surfaces that as a failed atom. Any other failure is
             * also "this page cannot be shown", and the not-found page is a
             * better answer for a stale profile link than an error boundary.
             */
            throw notFound()
        }

        if (params.id !== envelope.data.slug) {
            throw redirect({
                href: `/stats/players/${envelope.data.slug}`,
                statusCode: 301,
            })
        }

        return import.meta.env.SSR
            ? { dehydrated: dehydrateRegistry(context.registry) }
            : { dehydrated: [] }
    },
    component: Layout,
})

function Layout() {
    const { id } = Route.useParams()
    const playerId = parseEntityId(id) ?? 0
    const profile = useQuery(playerProfileAtom(playerId))

    // The legacy client hides the 2v2 tab entirely when the player has no team
    // record, because an empty tab is a dead end rather than a destination.
    const show2v2 =
        profile.data.ranked?.["2v2"]?.teams.some((team) => team.paired) ?? false

    return (
        <main className="ch-page">
            <PlayerHeader playerId={playerId} />
            <PlayerTabs playerId={playerId} show2v2={show2v2} />

            <div className="mt-4">
                <Outlet />
            </div>
        </main>
    )
}
