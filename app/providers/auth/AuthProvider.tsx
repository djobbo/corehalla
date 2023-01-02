import { createContext, useContext, useEffect, useState } from "react"
import { signIn, signOut } from "@ch/db/supabase/auth"
import { supabase } from "@ch/db/supabase/client"
import { useUserConnections } from "./useUserConnections"
import { useUserFavorites } from "./useUserFavorites"
import { useUserProfile } from "./useUserProfile"
import type { ReactNode } from "react"
import type { Session, User } from "@ch/db/supabase/client"
import type { UserConnection, UserProfile } from "@ch/db/generated/client"

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
        setSession(supabase.auth.session())

        const { data: authSubscription } = supabase.auth.onAuthStateChange(
            (evt, session) => {
                setSession(session)
            },
        )

        return () => {
            authSubscription?.unsubscribe()
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
