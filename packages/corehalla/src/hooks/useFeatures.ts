import { getFeatureFlags } from "../util/features"
import { useAuth } from "../providers/auth/AuthProvider"

export const useFeatureFlags = () => {
    const authContext = useAuth()

    return getFeatureFlags({ authContext })
}
