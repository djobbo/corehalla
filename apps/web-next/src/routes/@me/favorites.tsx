import { createFileRoute } from "@tanstack/react-router"
import { useAtomSet, useAtomValue } from "@effect/atom-react"
import { FavoritesGrid } from "@/components/account/FavoritesGrid"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import {
    connectionsAtom,
    favoritesAtom,
    sessionAtom,
    signIn,
    syncConnectionsAtom,
} from "@/effect/account"

export const Route = createFileRoute("/@me/favorites")({
    // No SSR: session is HttpOnly and unavailable on the server render.
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
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Spinner />
                    <span aria-hidden>Loading…</span>
                </div>
            </main>
        )
    }

    const user = session._tag === "Success" ? session.value.user : null

    if (!user) {
        return (
            <main className="ch-page flex flex-col items-start gap-4">
                <h1 className="ch-display text-3xl">Favorites</h1>
                <p className="text-sm text-muted-foreground">
                    Sign in to save players and clans, and to keep them across
                    devices.
                </p>
                <Button type="button" onClick={signIn}>
                    Sign in with Discord
                </Button>
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
                <p className="mt-1 text-sm text-muted-foreground">
                    Saved by {username}.
                </p>
            </header>
            {result._tag === "Initial" ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Spinner />
                    <span aria-hidden>Loading…</span>
                </div>
            ) : result._tag === "Failure" ? (
                <p className="text-sm text-destructive">
                    Could not load your favorites. Try reloading the page.
                </p>
            ) : (
                <>
                    <section aria-labelledby="favorites-players">
                        <Card>
                            <CardHeader>
                                <CardTitle id="favorites-players">
                                    Players
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <FavoritesGrid favorites={players} />
                            </CardContent>
                        </Card>
                    </section>
                    <section aria-labelledby="favorites-clans">
                        <Card>
                            <CardHeader>
                                <CardTitle id="favorites-clans">
                                    Clans
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <FavoritesGrid favorites={clans} />
                            </CardContent>
                        </Card>
                    </section>
                </>
            )}
            <section aria-labelledby="favorites-connections">
                <Card>
                    <CardHeader>
                        <CardTitle id="favorites-connections">
                            Linked Discord accounts
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-start gap-3">
                        {linked.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
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

                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() =>
                                syncConnections({
                                    reactivityKeys: ["connections"],
                                })
                            }
                        >
                            Refresh from Discord
                        </Button>
                    </CardContent>
                </Card>
            </section>
        </main>
    )
}
