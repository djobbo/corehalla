import { createFileRoute, Link, Outlet } from "@tanstack/react-router"
import {
    PlayerIdentity,
    playerTabs,
} from "@/components/player/PlayerTabContent"
import {
    playerAliasesAtom,
    playerRankedAtom,
    playerStatsAtom,
    preloadAtoms,
    useQuery,
} from "@/effect/atoms"
import { cleanString } from "@crh/common/helpers/cleanString"

/**
 * A player's profile page.
 *
 * The layout owns the header and the tab strip; each tab is a real child route,
 * so `/stats/player/123/legends` is a page you can link, share and reload rather
 * than a mode of a page. The profile's interesting content lives in the tabs, so
 * a tab that only exists as client state is content nothing can point at — which
 * is the arrangement this replaces.
 */
export const Route = createFileRoute("/stats/player/$playerId")({
    loader: ({ params, context }) =>
        preloadAtoms(context, [
            playerStatsAtom(Number(params.playerId)),
            playerRankedAtom(Number(params.playerId)),
            playerAliasesAtom(Number(params.playerId)),
        ]),
    component: Layout,
})

function Layout() {
    const { playerId } = Route.useParams()
    const aliases = useQuery(playerAliasesAtom(Number(playerId)))

    return (
        <main className="p-4">
            <PlayerIdentity playerId={Number(playerId)} />

            {aliases.length > 0 && (
                <p className="mt-1 text-xs text-textVar1">
                    Also known as {aliases.map(cleanString).join(", ")}
                </p>
            )}

            <nav className="mt-4 flex gap-1 border-b border-bg pb-2">
                {playerTabs.map(({ tab, label }) => {
                    // Annotated as `string`: the router's typed `to` accepts a
                    // plain string but not a template-literal type, and the
                    // path has to be built from the param.
                    const href: string =
                        tab === "overview"
                            ? `/stats/player/${playerId}`
                            : `/stats/player/${playerId}/${tab}`

                    return (
                    <Link
                        key={tab}
                        to={href}
                        activeOptions={{ exact: true }}
                        className="rounded px-2 py-1 text-sm text-textVar1"
                        activeProps={{
                            className:
                                "rounded px-2 py-1 text-sm bg-bg text-text",
                        }}
                    >
                        {label}
                    </Link>
                    )
                })}
            </nav>

            <div className="mt-4">
                <Outlet />
            </div>
        </main>
    )
}
