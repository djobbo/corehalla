import { useQuery } from "react-query"
import axios from "axios"

export const usePlayerAliases = (playerId: string) => {
    const { data: playerAliases, ...query } = useQuery(
        ["playerAliases", playerId],
        async () => {
            const { data } = await axios.get<string[]>(
                `/api/stats/player/${playerId}/aliases`,
            )

            if (!data) throw new Error("Player not found")
            return data
        },
        { enabled: !!playerId },
    )

    return {
        playerAliases: playerAliases || [],
        ...query,
    }
}
