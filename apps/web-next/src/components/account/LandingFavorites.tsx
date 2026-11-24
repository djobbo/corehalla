import { ClientOnly, Link } from "@tanstack/react-router"
import { useAtomValue } from "@effect/atom-react"
import { FavoritesGrid } from "@/components/account/FavoritesGrid"
import { Button } from "@/components/ui/button"
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
} from "@/components/ui/empty"
import { favoritesAtom, sessionAtom, signIn } from "@/effect/account"
import { landingFavorites } from "@/lib/landingFavorites"

/**
 * The session and the favourites are HttpOnly-cookie reads the server render
 * cannot make, so the slot is client-only: the landing's SSR output is the same
 * with or without a signed-in visitor.
 */
export const LandingFavorites = () => (
    <ClientOnly fallback={null}>
        <FavoritesSlot />
    </ClientOnly>
)

const FavoritesSlot = () => {
    const session = useAtomValue(sessionAtom)

    if (session._tag === "Initial") return null

    const user = session._tag === "Success" ? session.value.user : null

    return user ? <SignedIn /> : <SignedOutPrompt />
}

const Kicker = ({ manage }: { readonly manage?: boolean }) => (
    <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p id="landing-favorites" className="ch-kicker">
            Your favorites
        </p>
        {manage ? (
            <Link
                to="/@me/favorites"
                className="text-xs font-bold tracking-[0.12em] text-muted-foreground uppercase transition-colors hover:text-foreground"
            >
                Manage
            </Link>
        ) : null}
    </div>
)

const SignedIn = () => {
    const result = useAtomValue(favoritesAtom)

    // A failed read says nothing about the visitor's favourites, and the landing
    // has no error state, so the slot stays empty rather than claiming "none".
    if (result._tag === "Initial" || result._tag === "Failure") return null

    const favorites = result.value
    const { shown, hidden } = landingFavorites(favorites)

    return (
        <section aria-labelledby="landing-favorites" className="mt-10">
            <Kicker manage />
            {favorites.length === 0 ? (
                <div className="mt-2 flex flex-col items-start gap-3">
                    <FavoritesGrid favorites={[]} />
                    <Button
                        variant="secondary"
                        nativeButton={false}
                        render={<Link to="/rankings" />}
                    >
                        View rankings
                    </Button>
                </div>
            ) : (
                <div className="mt-2 flex flex-col gap-2">
                    <FavoritesGrid favorites={shown} />
                    {hidden > 0 ? (
                        <Button
                            variant="secondary"
                            size="sm"
                            nativeButton={false}
                            render={<Link to="/@me/favorites" />}
                            className="self-start"
                        >
                            View {hidden} more
                        </Button>
                    ) : null}
                </div>
            )}
        </section>
    )
}

const SignedOutPrompt = () => (
    <section aria-labelledby="landing-favorites" className="mt-10">
        <Kicker />
        <Empty className="mt-2">
            <EmptyHeader>
                <EmptyDescription>
                    Sign in to save the players and clans you follow — your
                    favorites show up here.
                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
                <Button type="button" onClick={signIn}>
                    Sign in with Discord
                </Button>
            </EmptyContent>
        </Empty>
    </section>
)
