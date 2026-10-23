import { CorehallaClient } from "./client"
import type { Favorite } from "@crh/api-contract/schemas"

// Client-only: session is an HttpOnly cookie the server render cannot read.
const ttl = "5 minutes"

export const sessionAtom = CorehallaClient.query("me", "getSession", {
    reactivityKeys: ["session"],
    timeToLive: ttl,
})

export const favoritesAtom = CorehallaClient.query("me", "getFavorites", {
    reactivityKeys: ["favorites"],
    timeToLive: ttl,
})

export const connectionsAtom = CorehallaClient.query("me", "getConnections", {
    reactivityKeys: ["connections"],
    timeToLive: ttl,
})

export const addFavoriteAtom = CorehallaClient.mutation("me", "addFavorite")

export const removeFavoriteAtom = CorehallaClient.mutation(
    "me",
    "deleteFavorite",
)

export const syncConnectionsAtom = CorehallaClient.mutation(
    "me",
    "syncConnections",
)

export const signOutAtom = CorehallaClient.mutation("auth", "signOut")

/** Full-page nav: OAuth ends in a redirect; fetch would leave the session unseen. */
export const signIn = () => {
    window.location.assign("/api/v1/auth/discord")
}

export const isFavorite = (
    favorites: readonly Favorite[],
    type: string,
    id: string,
): boolean => favorites.some((f) => f.type === type && f.id === id)

/** `meta` is client-authored `unknown`; malformed values degrade to no icon. */
export const favoriteLegendKey = (favorite: Favorite): string | undefined => {
    const meta = favorite.meta

    if (typeof meta !== "object" || meta === null) return undefined

    const icon = (meta as { icon?: unknown }).icon

    if (typeof icon !== "object" || icon === null) return undefined

    const key = (icon as { legend_key?: unknown }).legend_key

    return typeof key === "string" ? key : undefined
}
