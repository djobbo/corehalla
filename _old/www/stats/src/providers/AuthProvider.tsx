import { Session, User } from '@supabase/supabase-js'
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'

import { supabase } from '~supabase/client'

interface Discord3rdPartyApp {
    type: string
    id: string
    name: string
    verified: boolean
}

interface AuthContext {
    user: User
    discord3rdPartyApps: Discord3rdPartyApp[]
}

const authContext = createContext<AuthContext>({
    user: null,
    discord3rdPartyApps: [],
})

export const useAuth = (): AuthContext => useContext(authContext)

interface Props {
    children: ReactNode
}

export const AuthProvider = ({ children }: Props): JSX.Element => {
    const [user, setUser] = useState<User>(null)
    const [discord3rdPartyApps, setDiscord3rdPartyApps] = useState<Discord3rdPartyApp[]>([])

    const fetchProfile = async (session?: Session) => {
        const profileData = supabase.auth.user()

        setUser(profileData)

        if (!profileData) return

        await supabase.from('profiles').upsert({ id: profileData.id })

        if (!session || !session.provider_token) return

        try {
            const res = await fetch('https://discord.com/api/users/@me/connections', {
                headers: {
                    authorization: `Bearer ${session.provider_token}`,
                },
            })

            const apps = (await res.json()) as Discord3rdPartyApp[]
            setDiscord3rdPartyApps(apps)
        } catch {}
    }

    useEffect(() => {
        fetchProfile()

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            fetchProfile(session)
        })

        return () => {
            authListener?.unsubscribe()
        }
    }, [])

    const fetch3rdPartyApps = async (): Promise<void> => {
        if (!user) {
            setDiscord3rdPartyApps([])
            return
        }

        const { error, data } = await supabase
            .from<Discord3rdPartyApp & { user_id: string }>(`third_party`)
            .select('*')
            .eq('user_id', user.id)

        console.log({ data })

        if (error) {
            console.error(error)
            setDiscord3rdPartyApps([])
        }

        setDiscord3rdPartyApps(data)
    }

    useEffect(() => {
        ;(async () => {
            await fetch3rdPartyApps()
        })()

        if (!user) return

        const listener = supabase
            .from(`third_party:user_id=eq.${user.id}`)
            .on('*', async (payload) => {
                console.log({ payload })

                switch (payload.eventType) {
                    case 'DELETE':
                        setDiscord3rdPartyApps((current) =>
                            current.filter((app) => app.id !== payload.old.app_id && app.type === payload.old.type),
                        )
                        break
                    case 'INSERT':
                        setDiscord3rdPartyApps((current) => [...current, payload.new])
                        break
                    case 'UPDATE':
                        setDiscord3rdPartyApps((current) => [
                            ...current.filter((app) => app.id !== payload.old.app_id && app.type === payload.old.type),
                            payload.new,
                        ])
                        break
                    default:
                        break
                }
            })
            .subscribe()

        return () => {
            listener.unsubscribe()
        }
    }, [user])

    const update3rdPartyApps = async () => {
        try {
            await supabase.from('third_party').upsert(
                discord3rdPartyApps.map(({ id, name, type, verified }) => ({
                    app_id: id,
                    name,
                    type,
                    verified,
                    user_id: user.id,
                })),
            )
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        console.log({ discord3rdPartyApps })

        if (!user || discord3rdPartyApps.length <= 0) return

        update3rdPartyApps()
    }, [user, discord3rdPartyApps])

    return (
        <authContext.Provider
            value={{
                user,
                discord3rdPartyApps,
            }}
        >
            {children}
        </authContext.Provider>
    )
}
