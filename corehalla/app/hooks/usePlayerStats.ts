import { useQuery } from "react-query"
import axios from "axios"
import type { PlayerStats } from "bhapi/types"

export const usePlayerStats = (playerId: string) => {
    const { data: playerStats, ...query } = useQuery(
        ["playerStats", playerId],
        async () => {
            const { data } = await axios.get<PlayerStats>(
                `/api/stats/player/${playerId}/stats`,
            )

            if (!data.brawlhalla_id) throw new Error("Player not found")
            return data
        },
        { enabled: !!playerId },
    )

    return {
        playerStats,
        ...query,
    }
}
