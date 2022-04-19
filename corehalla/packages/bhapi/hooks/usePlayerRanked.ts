import { useQuery } from "react-query"
import axios from "axios"
import type { PlayerRanked } from "../types"

export const usePlayerRanked = (playerId: string) => {
    const { data: playerRanked, ...query } = useQuery(
        ["playerRanked", playerId],
        async () => {
            const { data } = await axios.get<PlayerRanked>(
                `/api/stats/player/${playerId}/ranked`,
            )

            if (!data.brawlhalla_id) throw new Error("Player not found")
            return data
        },
        { enabled: !!playerId },
    )

    return {
        playerRanked,
        ...query,
    }
}
