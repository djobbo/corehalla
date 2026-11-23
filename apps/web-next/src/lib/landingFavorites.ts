import type { Favorite } from "@crh/api-contract/schemas"

/** The landing previews this many favourites before deferring to the manage page. */
export const LANDING_FAVORITES_CAP = 6

export type LandingFavorites = {
    readonly shown: readonly Favorite[]
    readonly hidden: number
}

export const landingFavorites = (
    favorites: readonly Favorite[],
): LandingFavorites => ({
    shown: favorites.slice(0, LANDING_FAVORITES_CAP),
    hidden: Math.max(0, favorites.length - LANDING_FAVORITES_CAP),
})
