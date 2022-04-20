import { getUserConnections } from "../discord/getUserConnections"
import { logInfo } from "logger"
import { supabase } from "../supabase/client"
import { useCallback, useEffect, useState } from "react"
import type { Session } from "@supabase/supabase-js"
import type { UserConnection } from "../generated/client"

export const useUserConnections = (session: Session | null) => {
    const [userConnections, setUserConnections] = useState<UserConnection[]>([])
    const userId = session?.user?.id
    const discordToken = session?.provider_token

    const updateUserConnections = useCallback(async () => {
        if (!userId || !discordToken) return

        const userConnections = await getUserConnections(discordToken)

        if (!userConnections) return

        // TODO: delete old connections
        const { data: connections, error } = await supabase
            .from<UserConnection>("UserConnection")
            .upsert(
                userConnections.map(({ id, name, type, verified }) => ({
                    appId: id,
                    userId,
                    type,
                    verified,
                    name,
                })),
            )

        if (error) throw error

        setUserConnections(connections ?? [])
    }, [discordToken, userId])

    useEffect(() => {
        const subscription = supabase
            .from<UserConnection>("UserConnection")
            .on("*", (payload) => {
                logInfo("UserConnection Change received!", payload)
            })
            .subscribe()

        updateUserConnections()

        return () => {
            subscription.unsubscribe()
        }
    }, [updateUserConnections])

    return userConnections
}
