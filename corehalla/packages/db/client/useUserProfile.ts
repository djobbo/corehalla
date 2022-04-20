import { getDiscordProfile } from "../discord/getDiscordProfile"
import { supabase } from "../supabase/client"
import { useCallback, useEffect, useState } from "react"
import type { Session } from "@supabase/supabase-js"
import type { UserProfile } from "../generated/client"

export const useUserProfile = (session: Session | null) => {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
    const userId = session?.user?.id
    const discordToken = session?.provider_token

    const updateUserProfile = useCallback(async () => {
        if (!userId || !discordToken) return

        const discordProfile = await getDiscordProfile(discordToken)

        if (!discordProfile) return

        const { username, avatar } = discordProfile

        const { data: profile, error } = await supabase
            .from<UserProfile>("UserProfile")
            .upsert({
                id: userId,
                username,
                ...(avatar ? { avatarUrl: avatar ?? "" } : {}),
            })
            .single()

        if (error) throw error

        setUserProfile(profile)
    }, [userId, discordToken])

    useEffect(() => {
        const userProfileSubscription = supabase
            .from<UserProfile>("UserProfile")
            .on("*", (payload) => {
                if (payload.new.id !== userId) return
                setUserProfile(payload.new)
            })
            .subscribe()

        updateUserProfile()

        return () => {
            userProfileSubscription.unsubscribe()
        }
    }, [updateUserProfile, userId])

    return userProfile
}
