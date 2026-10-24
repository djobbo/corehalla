import { ClientOnly } from "@tanstack/react-router"
import { useAtomSet, useAtomValue } from "@effect/atom-react"
import * as AsyncResult from "effect/reactivity/AsyncResult"
import {
    addFavoriteAtom,
    favoritesAtom,
    isFavorite,
    removeFavoriteAtom,
    sessionAtom,
} from "@/effect/account"
import { Heart } from "lucide-react"
import { cn } from "@/lib/cn"

export type FavoriteButtonProps = {
    readonly type: "player" | "clan"
    readonly id: string
    readonly name: string
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
            <Heart
                aria-hidden
                className="size-3.5"
                fill={active ? "currentColor" : "none"}
            />
            {active ? "Saved" : "Favorite"}
        </button>
    )
}
