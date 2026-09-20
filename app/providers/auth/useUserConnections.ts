import { getUserConnections } from "db/discord/getUserConnections"
import { logInfo } from "logger"
import { supabase } from "db/supabase/client"
import { useCallback, useEffect, useState } from "react"
import type { Session } from "db/supabase/client"
import type { UserConnection } from "db/schema"
export const useUserConnections = (
    session: Session | null,
    updateEnabled = false,
) => {
    const [userConnections, setUserConnections] = useState<UserConnection[]>([])
    const userId = session?.user?.id
    const discordToken = session?.provider_token

    const updateUserConnections = useCallback(async () => {
        if (!userId || !discordToken) return

        const userConnections = await getUserConnections(discordToken)

        if (!userConnections) return

        // TODO: delete old connections
        const { data: connections, error } = await supabase
            .from("UserConnection")
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
        if (!updateEnabled) return

        const channel = supabase
            .channel(`user-connection:${userId}`)
            .on<UserConnection>(
                "postgres_changes",
                { event: "*", schema: "public", table: "UserConnection" },
                (payload) => {
                    logInfo("UserConnection Change received!", payload)
                },
            )
            .subscribe()

        return () => {
            void supabase.removeChannel(channel)
        }
    }, [updateUserConnections, updateEnabled])

    return userConnections
}
