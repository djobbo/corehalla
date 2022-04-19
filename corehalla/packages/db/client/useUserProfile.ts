import { getDiscordProfile } from "../discord/getDiscordProfile"
import { getUserConnections } from "../discord/getUserConnections"
import { supabase } from "../supabase/client"
import { useCallback, useEffect, useState } from "react"
import type { Session } from "@supabase/supabase-js"
import type { UserConnection, UserProfile } from "../generated/client"

export const useUserProfile = (session: Session | null) => {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
    const [userConnections, setUserConnections] = useState<UserConnection[]>([])
    const userId = session?.user?.id
    const discordToken = session?.provider_token

    const updateUserProfile = useCallback(async () => {
        if (!userId || !discordToken) return

        const discordProfile = await getDiscordProfile(discordToken)

        if (!discordProfile) return

        const { username, avatar } = discordProfile

        await supabase.from<UserProfile>("user_profiles").upsert({
            id: userId,
            username,
            ...(!!avatar && { avatarUrl: avatar }),
        })
    }, [userId, discordToken])

    const updateUserConnections = useCallback(async () => {
        if (!userId || !discordToken) return

        const userConnections = await getUserConnections(discordToken)

        if (!userConnections) return

        // TODO: delete old connections
        await supabase.from<UserConnection>("user_connections").upsert(
            userConnections.map(({ id, name, type, verified }) => ({
                appId: id,
                userId,
                type,
                verified,
                name,
            })),
        )
    }, [discordToken, userId])

    useEffect(() => {
        const userProfileSubscription = supabase
            .from<UserProfile>("user_profiles")
            .on("*", (payload) => {
                if (payload.new.id !== userId) return
                console.log("UserProfile Change received!", payload)
                setUserProfile(payload.new)
            })
            .subscribe()

        updateUserProfile()

        return () => {
            userProfileSubscription.unsubscribe()
        }
    }, [updateUserProfile, userId])

    useEffect(() => {
        const userConnectionsSubscription = supabase
            .from<UserConnection>("user_connections")
            .on("*", (payload) => {
                console.log("UserConnection Change received!", payload)
            })
            .subscribe()

        updateUserConnections()

        return () => {
            userConnectionsSubscription.unsubscribe()
        }
    }, [updateUserConnections])

    return {
        userProfile,
        userConnections,
    }
}
