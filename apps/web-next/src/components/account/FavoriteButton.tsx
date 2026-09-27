import { ClientOnly } from "@tanstack/react-router"
import { useAtomSet, useAtomValue } from "@effect/atom-react"
import * as AsyncResult from "effect/unstable/reactivity/AsyncResult"
import {
    addFavoriteAtom,
    favoritesAtom,
    isFavorite,
    removeFavoriteAtom,
    sessionAtom,
} from "@/effect/account"
import { HeartIcon } from "@/components/ui/icons"
import { cn } from "@/lib/cn"

/**
 * Save this player or clan, for the signed-in user.
 *
 * Three nested pieces, each with one job:
 *
 * - `FavoriteButton` is the `<ClientOnly>` seam. The session is an `HttpOnly`
 *   cookie, so the server render cannot read it; mounting the atoms only on the
 *   client is what keeps the server HTML from asserting a state the client then
 *   contradicts.
 * - `FavoriteToggle` decides whether the control exists at all. A signed-out
 *   visitor gets no button rather than a button that fails: favourites are not
 *   a feature they can use yet, and the sign-in path is already in the masthead.
 * - `FavoriteControl` is the actual switch, reading the shared favourites atom
 *   so every surface agrees about what is saved.
 */
export type FavoriteButtonProps = {
    readonly type: "player" | "clan"
    readonly id: string
    readonly name: string
    /**
     * Presentation hints stored with the row. For a player, the main legend's
     * key, so the favourites page can show the same art the profile does.
     */
    readonly meta?: unknown
}

export const FavoriteButton = (props: FavoriteButtonProps) => (
    <ClientOnly>
        <FavoriteToggle {...props} />
    </ClientOnly>
)

const FavoriteToggle = (props: FavoriteButtonProps) => {
    const session = useAtomValue(sessionAtom)
    const user = session._tag === "Success" ? session.value.user : null

    if (!user) return null

    return <FavoriteControl {...props} />
}

const FavoriteControl = ({ type, id, name, meta }: FavoriteButtonProps) => {
    const result = useAtomValue(favoritesAtom)
    const add = useAtomSet(addFavoriteAtom)
    const remove = useAtomSet(removeFavoriteAtom)
    const addState = useAtomValue(addFavoriteAtom)
    const removeState = useAtomValue(removeFavoriteAtom)

    const favorites = result._tag === "Success" ? result.value : []
    const active = isFavorite(favorites, type, id)
    const busy =
        AsyncResult.isWaiting(addState) || AsyncResult.isWaiting(removeState)

    const toggle = () => {
        if (busy) return

        // The write publishes `favorites`, which refreshes the list every
        // surface reads. There is no local edit to keep in step.
        if (active) {
            remove({
                query: { type, id },
                reactivityKeys: ["favorites"],
            })
        } else {
            add({
                payload: { id, type, name, meta: meta ?? {} },
                reactivityKeys: ["favorites"],
            })
        }
    }

    return (
        <button
            type="button"
            onClick={toggle}
            disabled={busy}
            aria-pressed={active}
            className={cn(
                "ch-chip",
                active ? "ch-chip-on" : "ch-chip-off",
                busy && "opacity-60",
            )}
        >
            <HeartIcon filled={active} className="h-3.5 w-3.5" />
            {active ? "Saved" : "Favorite"}
        </button>
    )
}
