import { trpc } from "@util/trpc"

export const usePlayerAliases = (playerId: string) => {
    const { data, ...query } = trpc.getPlayerAliases.useQuery({ playerId })

    return {
        playerAliases: data ?? [],
        ...query,
    }
}
