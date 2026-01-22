import { trpc } from "../../util/trpc"

export const usePlayerStats = (playerId: string) => {
    const { data, ...query } = trpc.getPlayerStats.useQuery({ playerId })

    return {
        playerStats: data,
        ...query,
    }
}
