import type { AuthContext } from "@ctx/auth/AuthProvider"

export type FeatureFlags = keyof ReturnType<typeof getFeatureFlags>

const __DEV = process.env.NODE_ENV === "development"

export const getFeatureFlags = ({
    authContext: _authContext,
}: {
    authContext?: AuthContext
}) => {
    // const isSSR = typeof window === "undefined"
    // const isProductionWebsite =
    //     import.meta.env.VITE_FORCE_PRODUCTION_WEBSITE ||
    //     (!isSSR && window.location.hostname === "corehalla.com")

    return {
        // shouldUseVercelImageOptimization: false,
        shouldShowDummyFavorites: false,
        shouldShowInfoTooltips: true, // TODO: Add setting to toggle this
        shouldShowAds: true, // TODO: premium??
    } as const
}
