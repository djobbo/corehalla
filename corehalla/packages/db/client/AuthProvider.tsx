import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { signIn, signOut } from "../supabase/auth"
import { supabase } from "../supabase/client"
import { useUserProfile } from "./useUserProfile"
import type { ReactNode } from "react"
import type { Session, User } from "@supabase/supabase-js"
import type { UserProfile } from "../generated/client"

interface AuthContext {
    isLoggedIn: boolean
    session: Session | null
    user: User | null
    userProfile: UserProfile | null
    signIn: () => void
    signOut: () => void
}

const authContext = createContext<AuthContext>({
    isLoggedIn: false,
    session: null,
    user: null,
    userProfile: null,
    signIn: () => void 0,
    signOut: () => void 0,
})

export const useAuth = (): AuthContext => useContext(authContext)

interface Props {
    children: ReactNode
}

export const AuthProvider = ({ children }: Props) => {
    const [session, setSession] = useState<Session | null>(null)
    const { userProfile } = useUserProfile(session)

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

    const isLoggedIn = useMemo(
        () => !!session && !!userProfile,
        [session, userProfile],
    )

    return (
        <authContext.Provider
            value={{
                session,
                user: session?.user ?? null,
                userProfile,
                isLoggedIn,
                signIn,
                signOut,
            }}
        >
            {children}
        </authContext.Provider>
    )
}
