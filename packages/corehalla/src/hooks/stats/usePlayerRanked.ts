import { trpc } from "../../util/trpc"

export const usePlayerRanked = (playerId: string) => {
    const { data, ...query } = trpc.getPlayerRanked.useQuery({ playerId })

    return {
        playerRanked: data,
        ...query,
    }
}
