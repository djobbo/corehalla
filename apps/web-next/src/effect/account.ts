import { CorehallaClient } from "./client"
import type { Favorite } from "@crh/api-contract/schemas"

/**
 * The signed-in account, as atoms.
 *
 * Every read and write goes through the app's existing typed API client, so the
 * browser and the server render call the same endpoints the contract declares
 * and the response shapes are decoded rather than cast. Auth is not a special
 * case of transport here: it is two more groups on the API.
 *
 * ## Why the writes invalidate rather than patch
 *
 * A favourite write is followed by a refetch of the list, not by a local edit.
 * `reactivityKeys` is the mechanism: a mutation that succeeds publishes its
 * keys, and every query atom tagged with them refreshes. That keeps the server
 * the single source of truth — the optimistic version has to guess at what the
 * server stored, and a guess that is wrong is worse than a round trip that is
 * right. It also means the account menu, the profile button and the favourites
 * page cannot disagree, because they read the same atoms.
 *
 * ## Why these atoms are client-only
 *
 * The session is an `HttpOnly` cookie that only the browser holds, so a server
 * render has nothing to read it with and would always render "signed out" —
 * which the client would then hydrate away, producing exactly the mismatch
 * hydration is meant to prevent. Components that mount these live behind
 * `ClientOnly`, and the favourites route opts out of SSR entirely.
 */

const ttl = "5 minutes"

/** Who is signed in, or `user: null`. Always answers, even when anonymous. */
export const sessionAtom = CorehallaClient.query("me", "getSession", {
    reactivityKeys: ["session"],
    timeToLive: ttl,
})

/** The signed-in user's saved players and clans. 401s when anonymous. */
export const favoritesAtom = CorehallaClient.query("me", "getFavorites", {
    reactivityKeys: ["favorites"],
    timeToLive: ttl,
})

/** The signed-in user's linked Discord accounts. */
export const connectionsAtom = CorehallaClient.query("me", "getConnections", {
    reactivityKeys: ["connections"],
    timeToLive: ttl,
})

/** Add or update a favourite. The row is keyed by `(type, id)`. */
export const addFavoriteAtom = CorehallaClient.mutation("me", "addFavorite")

/** Remove a favourite, keyed by the same pair. */
export const removeFavoriteAtom = CorehallaClient.mutation(
    "me",
    "deleteFavorite",
)

/** Re-read linked Discord accounts from Discord and store them. */
export const syncConnectionsAtom = CorehallaClient.mutation(
    "me",
    "syncConnections",
)

export const signOutAtom = CorehallaClient.mutation("auth", "signOut")

/**
 * Start the Discord sign-in.
 *
 * A full-page navigation rather than a fetch: the flow ends in a redirect back
 * to `/`, and a `fetch` would leave the browser on the current page with a
 * session it does not know it has.
 */
export const signIn = () => {
    window.location.assign("/api/v1/auth/discord")
}

/** The invariants a signed-in surface cares about, in one place. */
export const isFavorite = (
    favorites: readonly Favorite[],
    type: string,
    id: string,
): boolean => favorites.some((f) => f.type === type && f.id === id)

/**
 * A player favourite's main-legend key, if one was stored.
 *
 * `meta` is client-authored and decoded as `unknown`, so it is narrowed here
 * rather than at each render site. A malformed value degrades to "no icon",
 * which is the same thing an older favourite without meta produces.
 */
export const favoriteLegendKey = (favorite: Favorite): string | undefined => {
    const meta = favorite.meta

    if (typeof meta !== "object" || meta === null) return undefined

    const icon = (meta as { icon?: unknown }).icon

    if (typeof icon !== "object" || icon === null) return undefined

    const key = (icon as { legend_key?: unknown }).legend_key

    return typeof key === "string" ? key : undefined
}
