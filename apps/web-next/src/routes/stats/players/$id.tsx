import { createFileRoute, Outlet } from "@tanstack/react-router"
import { isPairedTeam } from "@/lib/rankings"
import { PlayerHeader } from "@/components/player/PlayerHeader"
import { PlayerTabs } from "@/components/player/PlayerTabs"
import {
    player3v3RankedAtom,
    playerAliasesAtom,
    playerRankedAtom,
    playerStatsAtom,
    preloadAtoms,
    useQuery,
} from "@/effect/atoms"

/**
 * A player's profile page.
 *
 * The layout owns the header and the tab strip; each tab is a real child route,
 * so `/stats/players/123/legends` is a page you can link, share and reload rather
 * than a mode of a page. That split is also what keeps the header from
 * re-rendering when a tab changes, and lets each tab declare the atoms it needs
 * in its own loader.
 *
 * The tab content itself lives in `@/components/player`, one module per tab —
 * the layout's job is only to establish what the page *is*.
 */
export const Route = createFileRoute("/stats/players/$id")({
    loader: ({ params, context }) =>
        preloadAtoms(context, [
            playerStatsAtom(Number(params.id)),
            playerRankedAtom(Number(params.id)),
            player3v3RankedAtom(Number(params.id)),
            playerAliasesAtom(Number(params.id)),
        ]),
    component: Layout,
})

function Layout() {
    const { id: playerId } = Route.useParams()
    const id = Number(playerId)

    // The legacy client hides the 2v2 tab entirely when the player has no team
    // record, because an empty tab is a dead end rather than a destination.
    const ranked = useQuery(playerRankedAtom(id))

    return (
        <main className="ch-page">
            <PlayerHeader playerId={id} />
            <PlayerTabs
                playerId={id}
                show2v2={(ranked?.["2v2"] ?? []).some(isPairedTeam)}
            />

            <div className="mt-4">
                <Outlet />
            </div>
        </main>
    )
}
