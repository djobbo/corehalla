import { getFeatureFlags } from "@util/features"
import { useAuth } from "@ctx/auth/AuthProvider"

export const useFeatureFlags = () => {
    const authContext = useAuth()

    return getFeatureFlags({ authContext })
}
