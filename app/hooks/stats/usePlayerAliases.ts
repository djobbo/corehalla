import { trpc } from "@util/trpc"
import { cleanString } from "common/helpers/cleanString"

export const usePlayerAliases = (playerId: string) => {
    const { data, ...query } = trpc.getPlayerAliases.useQuery({ playerId })

    return {
        playerAliases:
            data
                ?.map((alias) => cleanString(alias))
                .filter(
                    (alias) => alias.length >= 2 && !alias.endsWith("•2"),
                ) ?? [],
        ...query,
    }
}
