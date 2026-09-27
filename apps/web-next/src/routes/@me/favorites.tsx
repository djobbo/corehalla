import { createFileRoute } from "@tanstack/react-router"
import { useAtomSet, useAtomValue } from "@effect/atom-react"
import { FavoritesGrid } from "@/components/account/FavoritesGrid"
import { Card } from "@/components/ui/Card"
import {
    connectionsAtom,
    favoritesAtom,
    sessionAtom,
    signIn,
    syncConnectionsAtom,
} from "@/effect/account"

/**
 * The signed-in user's saved players and clans.
 *
 * `ssr: false` because the session is an `HttpOnly` cookie only the browser
 * holds: the server has nothing to render this page from, and rendering a
 * signed-out shell that the client then replaces is the hydration mismatch the
 * flag exists to avoid.
 */
export const Route = createFileRoute("/@me/favorites")({
    ssr: false,
    head: () => ({
        meta: [
            { title: "My favorites • Corehalla" },
            { name: "robots", content: "noindex" },
        ],
    }),
    component: Page,
})

function Page() {
    const session = useAtomValue(sessionAtom)

    if (session._tag === "Initial") {
        return (
            <main className="ch-page">
                <p className="text-sm text-textVar1">Loading…</p>
            </main>
        )
    }

    const user = session._tag === "Success" ? session.value.user : null

    if (!user) {
        return (
            <main className="ch-page flex flex-col items-start gap-4">
                <h1 className="ch-display text-3xl">Favorites</h1>
                <p className="text-sm text-textVar1">
                    Sign in to save players and clans, and to keep them across
                    devices.
                </p>
                <button type="button" className="ch-btn" onClick={signIn}>
                    Sign in with Discord
                </button>
            </main>
        )
    }

    return <SignedIn username={user.username} />
}

const SignedIn = ({ username }: { readonly username: string }) => {
    const result = useAtomValue(favoritesAtom)
    const connections = useAtomValue(connectionsAtom)
    const syncConnections = useAtomSet(syncConnectionsAtom)

    const favorites = result._tag === "Success" ? result.value : []
    const linked = connections._tag === "Success" ? connections.value : []

    const players = favorites.filter((favorite) => favorite.type === "player")
    const clans = favorites.filter((favorite) => favorite.type !== "player")

    return (
        <main className="ch-page flex flex-col gap-6">
            <header>
                <h1 className="ch-display text-3xl">Favorites</h1>
                <p className="mt-1 text-sm text-textVar1">
                    Saved by {username}.
                </p>
            </header>

            {result._tag === "Initial" ? (
                <p className="text-sm text-textVar1">Loading…</p>
            ) : result._tag === "Failure" ? (
                <p className="text-sm text-danger">
                    Could not load your favorites. Try reloading the page.
                </p>
            ) : (
                <>
                    <section>
                        <h2 className="ch-card-title">Players</h2>
                        <div className="mt-3">
                            <FavoritesGrid favorites={players} />
                        </div>
                    </section>

                    <section>
                        <h2 className="ch-card-title">Clans</h2>
                        <div className="mt-3">
                            <FavoritesGrid favorites={clans} />
                        </div>
                    </section>
                </>
            )}

            {/*
             * Connections are fetched from Discord on demand rather than on
             * every visit: it is a third-party call, and nothing here changes
             * often enough to justify one on each page load.
             */}
            <Card title="Linked Discord accounts">
                {linked.length === 0 ? (
                    <p className="text-sm text-textVar1">
                        Nothing linked yet.
                    </p>
                ) : (
                    <ul className="flex flex-wrap gap-2">
                        {linked.map((connection) => (
                            <li
                                key={`${connection.type}/${connection.appId}`}
                                className="ch-chip ch-chip-off"
                            >
                                {connection.name}
                                {connection.verified ? " ✓" : ""}
                            </li>
                        ))}
                    </ul>
                )}

                <button
                    type="button"
                    className="ch-btn mt-3"
                    onClick={() =>
                        syncConnections({ reactivityKeys: ["connections"] })
                    }
                >
                    Refresh from Discord
                </button>
            </Card>
        </main>
    )
}
