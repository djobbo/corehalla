import { Effect, Option, Schedule } from "effect"
import { getDiscordProfile } from "db/discord/getDiscordProfile"
import { supabase } from "db/supabase/client"
import { useEffect, useState } from "react"
import type { Session } from "db/supabase/client"
import { AuthError } from "@/effect/errors"
import type { UserProfile } from "db/schema"
/**
 * Fetches and keeps the signed-in user's profile in sync.
 *
 * React Query was removed in favour of Effect: retries use Effect's
 * `Schedule.exponential` and realtime updates re-run the effect instead of
 * invalidating a query key.
 */

const profileRetry = {
    schedule: Schedule.exponential("200 millis"),
    times: 3,
} as const

const readProfile = () =>
    Effect.tryPromise({
        async try() {
            const { data } = await supabase
                .from("UserProfile")
                .select("*")
                .throwOnError()
                .single()

            return data
        },
        catch: (cause) => new AuthError({ cause }),
    }).pipe(Effect.retry(profileRetry))

const syncDiscordProfile = (userId: string, token: string) =>
    Effect.gen(function* () {
        const discordProfile = yield* Effect.tryPromise({
            try: () => getDiscordProfile(token),
            catch: (cause) => new AuthError({ cause }),
        })

        if (!discordProfile) return

        const { username, avatar } = discordProfile

        yield* Effect.tryPromise({
            async try() {
                await supabase
                    .from("UserProfile")
                    .upsert({
                        id: userId,
                        username,
                        ...(avatar ? { avatarUrl: avatar } : {}),
                    })
                    .throwOnError()
            },
            catch: (cause) => new AuthError({ cause }),
        })
    }).pipe(Effect.retry(profileRetry))

export const useUserProfile = (session: Session | null) => {
    const userId = session?.user?.id
    const discordToken = session?.provider_token

    const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
    const [refreshToken, setRefreshToken] = useState(0)

    useEffect(() => {
        if (!userId) {
            setUserProfile(null)
            return
        }

        let cancelled = false

        const program = Effect.gen(function* () {
            const first = yield* readProfile().pipe(Effect.option)

            if (Option.isSome(first)) return first.value

            // The row may not exist yet: backfill it from Discord, then retry.
            if (discordToken) {
                yield* syncDiscordProfile(userId, discordToken).pipe(
                    Effect.ignore,
                )

                const second = yield* readProfile().pipe(Effect.option)

                return Option.getOrNull(second)
            }

            return null
        })

        void Effect.runPromise(program).then((profile) => {
            if (!cancelled) setUserProfile(profile)
        })

        return () => {
            cancelled = true
        }
    }, [userId, discordToken, refreshToken])

    useEffect(() => {
        if (!userId) return

        const channel = supabase
            .channel(`user-profile:${userId}`)
            .on<UserProfile>(
                "postgres_changes",
                { event: "*", schema: "public", table: "UserProfile" },
                (payload) => {
                    if (payload.eventType === "DELETE") return
                    if (payload.new.id !== userId) return
                    setRefreshToken((token) => token + 1)
                },
            )
            .subscribe()

        return () => {
            void supabase.removeChannel(channel)
        }
    }, [userId])

    return userProfile
}
