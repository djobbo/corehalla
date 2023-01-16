import { trpc } from "@util/trpc"

export const usePlayerAliases = (playerId: string) => {
    const { data, ...query } = trpc.getPlayerAliases.useQuery({ playerId })

    return {
        playerAliases:
            data?.filter(
                (alias) => alias.length >= 2 && !alias.endsWith("•2"),
            ) ?? [],
        ...query,
    }
}
