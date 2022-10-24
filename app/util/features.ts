import type { AuthContext } from "@ctx/auth/AuthProvider"

export type FeatureFlags = keyof ReturnType<typeof getFeatureFlags>

export const getFeatureFlags = ({
    //eslint-disable-next-line @typescript-eslint/no-unused-vars
    authContext,
}: {
    authContext?: AuthContext
}) => {
    return {
        vercelImageOptimizationEnabled: false,
    } as const
}
