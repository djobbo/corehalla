import { getDiscordProfile } from "db/discord/getDiscordProfile"
import { supabase } from "db/supabase/client"
import { useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import type { Session } from "db/supabase/client"
import type { UserProfile } from "db/generated/client"

/**
 * Fetches and keeps the signed-in user's profile in sync.
 *
 * Ported from the Next.js app to TanStack Query v5 (object syntax). Data access
 * stays on the browser Supabase client, matching the existing auth model.
 */
export const useUserProfile = (session: Session | null) => {
    const userId = session?.user?.id
    const discordToken = session?.provider_token

    const queryClient = useQueryClient()

    const { data: userProfile, isError: failedToFetchUserProfile } = useQuery({
        queryKey: ["userProfile", userId],
        queryFn: async () => {
            const { data } = await supabase
                .from<UserProfile>("UserProfile")
                .select("*")
                .throwOnError()
                .single()

            return data
        },
        enabled: !!userId,
        retry(failureCount) {
            return failureCount < 2
        },
    })

    useQuery({
        queryKey: ["discordProfile", userId, discordToken],
        queryFn: async () => {
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
        enabled: !!discordToken && !!userId && failedToFetchUserProfile,
    })

    useEffect(() => {
        if (!userId) return

        const subscription = supabase
            .from<UserProfile>("UserProfile")
            .on("*", (payload) => {
                if (payload.new.id !== userId) return
                queryClient.invalidateQueries({
                    queryKey: ["userProfile", userId],
                })
            })
            .subscribe()

        return () => {
            subscription.unsubscribe()
        }
    }, [queryClient, userId])

    return userProfile ?? null
}
