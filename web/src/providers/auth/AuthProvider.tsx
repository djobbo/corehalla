import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react"
import { useUserConnections } from "./useUserConnections"
import { useUserFavorites } from "./useUserFavorites"
import type { ReactNode } from "react"
import type { UserProfile } from "db/schema"

/**
 * Client-side auth state.
 *
 * Supabase Auth used to own the session in `localStorage` plus a realtime
 * subscription. Now the server owns it behind an HttpOnly cookie: this provider
 * asks `/api/me/session` once, and sign-in is a full-page redirect into the
 * Discord OAuth route.
 */
export type AuthContext = {
    isLoggedIn: boolean
    isPending: boolean
    user: UserProfile | null
    userProfile: UserProfile | null
    signIn: () => void
    signOut: () => void
    userConnections: ReturnType<typeof useUserConnections>
    userFavorites: ReturnType<typeof useUserFavorites>
}

const authContext = createContext<AuthContext>({
    isLoggedIn: false,
    isPending: false,
    user: null,
    userProfile: null,
    signIn: () => void 0,
    signOut: () => void 0,
    userConnections: [],
    userFavorites: {
        favorites: [],
        addFavorite: async () => void 0,
        removeFavorite: async () => void 0,
        editFavorite: async () => void 0,
        clanFavorites: [],
        playerFavorites: [],
        isFavorite: () => false,
    },
})

export const useAuth = (): AuthContext => useContext(authContext)
export const useFavorites = () => useAuth().userFavorites

interface Props {
    children: ReactNode
}

export const AuthProvider = ({ children }: Props) => {
    const [user, setUser] = useState<UserProfile | null>(null)
    const [isPending, setIsPending] = useState(true)
    const userConnections = useUserConnections(user)
    const userFavorites = useUserFavorites(user)

    useEffect(() => {
        let cancelled = false

        fetch("/api/me/session", { headers: { accept: "application/json" } })
            .then((response) => (response.ok ? response.json() : null))
            .then((data: { user: UserProfile | null } | null) => {
                if (!cancelled) setUser(data?.user ?? null)
            })
            .catch(() => {
                if (!cancelled) setUser(null)
            })
            .finally(() => {
                if (!cancelled) setIsPending(false)
            })

        return () => {
            cancelled = true
        }
    }, [])

    const signIn = useCallback(() => {
        window.location.assign("/api/auth/discord")
    }, [])

    const signOut = useCallback(() => {
        void fetch("/api/auth/signout", { method: "POST" }).finally(() => {
            setUser(null)
            window.location.assign("/")
        })
    }, [])

    return (
        <authContext.Provider
            value={{
                user,
                userProfile: user,
                isLoggedIn: !!user,
                isPending,
                signIn,
                signOut,
                userConnections,
                userFavorites,
            }}
        >
            {children}
        </authContext.Provider>
    )
}
