import { getDiscordProfile } from "../discord/getDiscordProfile"
import { getUserConnections } from "../discord/getUserConnections"
import { supabase } from "../supabase/client"
import { useCallback, useEffect } from "react"
import { useQuery } from "react-query"
import type { Session } from "@supabase/supabase-js"
import type { UserConnection, UserProfile } from "../generated/client"

export const useUserProfile = (session: Session | null) => {
    const userId = session?.user?.id
    const discordToken = session?.provider_token

    const { data: userProfile, ...query } = useQuery(
        "userProfile",
        async () => {
            if (!userId) throw new Error("No userId")

            const { error, data } = await supabase
                .from<UserProfile>("UserProfile")
                .select("*")
                .eq("id", userId)
                .single()

            if (error) throw new Error(error.message)

            return data
        },
        {
            enabled: !!userId,
        },
    )

    const updateUserProfile = useCallback(async () => {
        if (!userId || !discordToken) return

        const discordProfile = await getDiscordProfile(discordToken)

        if (!discordProfile) return

        const { username, avatar } = discordProfile

        await supabase.from<UserProfile>("UserProfile").upsert({
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
        await supabase.from<UserConnection>("UserConnection").upsert(
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
        updateUserProfile()
    }, [updateUserProfile])

    useEffect(() => {
        updateUserConnections()
    }, [updateUserConnections])

    return {
        userProfile: userProfile ?? null,
        ...query,
    }
}
