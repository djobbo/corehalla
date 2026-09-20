import { useEffect, useState } from "react"
import type { UserConnection, UserProfile } from "db/schema"

/**
 * The signed-in user's Discord connections.
 *
 * The Discord access token lives in the server session now, so the browser no
 * longer calls the Discord API or writes through PostgREST: `POST
 * /api/me/connections` asks the server to refresh them from Discord, and `GET`
 * reads back what is stored.
 */
export const useUserConnections = (user: UserProfile | null) => {
    const [userConnections, setUserConnections] = useState<UserConnection[]>([])
    const userId = user?.id

    useEffect(() => {
        if (!userId) {
            setUserConnections([])
            return
        }

        let cancelled = false

        const load = async () => {
            const synced = await fetch("/api/me/connections", {
                method: "POST",
            })

            if (synced.ok) {
                return (await synced.json()) as UserConnection[]
            }

            const stored = await fetch("/api/me/connections", {
                headers: { accept: "application/json" },
            })

            return stored.ok ? ((await stored.json()) as UserConnection[]) : []
        }

        void load()
            .then((connections) => {
                if (!cancelled) setUserConnections(connections)
            })
            .catch(() => {
                if (!cancelled) setUserConnections([])
            })

        return () => {
            cancelled = true
        }
    }, [userId])

    return userConnections
}
