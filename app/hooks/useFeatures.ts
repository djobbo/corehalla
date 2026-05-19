import { useAuth } from "#/providers/auth/AuthProvider"
import { getFeatureFlags } from "#/util/features"

export const useFeatureFlags = () => {
    const authContext = useAuth()

    return getFeatureFlags({ authContext })
}
