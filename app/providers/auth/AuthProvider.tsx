import { createContext, useContext, useEffect, useState } from "react"
import { signIn, signOut } from "db/supabase/auth"
import { supabase } from "db/supabase/client"
import { useUserConnections } from "./useUserConnections"
import { useUserFavorites } from "./useUserFavorites"
import { useUserProfile } from "./useUserProfile"
import type { ReactNode } from "react"
import type { Session, User } from "db/supabase/client"
import type { UserConnection, UserProfile } from "db/schema"
export type AuthContext = {
    isLoggedIn: boolean
    session: Session | null
    user: User | null
    userProfile: UserProfile | null
    signIn: () => void
    signOut: () => void
    userConnections: UserConnection[]
    userFavorites: ReturnType<typeof useUserFavorites>
}

const authContext = createContext<AuthContext>({
    isLoggedIn: false,
    session: null,
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
    const [session, setSession] = useState<Session | null>(null)
    const userProfile = useUserProfile(session)
    const userConnections = useUserConnections(session, !!userProfile)
    const userFavorites = useUserFavorites(session)

    useEffect(() => {
        // v2: `auth.session()` is gone and the subscription now lives on
        // `data.subscription`. `onAuthStateChange` emits `INITIAL_SESSION` as
        // soon as it subscribes, so it is the single source of truth for the
        // session (no separate `getSession()` call is needed).
        const { data } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
        })

        return () => {
            data.subscription.unsubscribe()
        }
    }, [])

    const isLoggedIn = !!session && !!userProfile

    return (
        <authContext.Provider
            value={{
                session,
                user: session?.user ?? null,
                userProfile,
                isLoggedIn,
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
