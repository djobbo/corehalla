import { getDiscordProfile } from "@ch/db/discord/getDiscordProfile"
import { supabase } from "@ch/db/supabase/client"
import { useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import type { Session } from "@ch/db/supabase/client"
import type { UserProfile } from "@ch/db/generated/client"

export const useUserProfile = (session: Session | null) => {
    const userId = session?.user?.id
    const discordToken = session?.provider_token

    const queryClient = useQueryClient()

    const { data: userProfile, isError: failedToFetchUserProfile } = useQuery(
        ["userProfile", userId],
        async () => {
            const { data } = await supabase
                .from<UserProfile>("UserProfile")
                .select("*")
                .throwOnError()
                .single()

            return data
        },
        {
            enabled: !!userId,
            retry(failureCount) {
                return failureCount < 2
            },
        },
    )

    useQuery(
        ["discordProfile", userId, discordToken],
        async () => {
            const discordProfile = await getDiscordProfile(discordToken ?? "")

            if (!discordProfile)
                throw new Error("Failed to fetch discord profile")

            const { username, avatar } = discordProfile

            await supabase
                .from<UserProfile>("UserProfile")
                .upsert({
                    id: userId,
                    username,
                    ...(avatar ? { avatarUrl: avatar ?? "" } : {}),
                })
                .throwOnError()
        },
        {
            enabled: !!discordToken && !!userId && failedToFetchUserProfile,
        },
    )

    useEffect(() => {
        if (!userId) return

        const subscription = supabase
            .from<UserProfile>("UserProfile")
            .on("*", (payload) => {
                if (payload.new.id !== userId) return
                queryClient.invalidateQueries(["userProfile", userId])
            })
            .subscribe()

        return () => {
            subscription.unsubscribe()
        }
    }, [queryClient, userId])

    return userProfile ?? null
}
