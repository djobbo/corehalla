import type { AuthContext } from "@ctx/auth/AuthProvider"

export type FeatureFlags = keyof ReturnType<typeof getFeatureFlags>

const __DEV = process.env.NODE_ENV === "development"

export const getFeatureFlags = ({
    authContext,
}: {
    authContext?: AuthContext
}) => {
    return {
        // shouldUseVercelImageOptimization: false,
        shouldShowDummyFavorites: false && __DEV && !authContext?.isLoggedIn,
        shouldShowBackToTop: true, // TODO: Add setting to toggle this
        shouldShowInfoTooltips: true, // TODO: Add setting to toggle this
    } as const
}
