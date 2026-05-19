import { trpc } from "@util/trpc"
import type { Ranking1v1 } from "bhapi/types"

type PlayerAliasSearchResult = {
    playerId: string
    mainAlias: string
    otherAliases: string[]
}

const EMPTY_RANKINGS: Ranking1v1[] = []
const EMPTY_ALIASES: PlayerAliasSearchResult[] = []

export const usePlayerSearch = (
    search: string,
): {
    rankings1v1: Ranking1v1[]
    isLoading: boolean
    aliases: PlayerAliasSearchResult[]
} => {
    // BMG DB Destroyer 🤦
    // const { rankings1v1, isLoading } = useRankings1v1("all", "1", search, {
    //     enabled: !!search,
    // })
    const { data: aliases, isLoading } = trpc.searchPlayerAlias.useQuery(
        { alias: search, page: "1" },
        { enabled: !!search },
    )

    return {
        rankings1v1: EMPTY_RANKINGS,
        isLoading,
        aliases: (aliases ?? EMPTY_ALIASES) as PlayerAliasSearchResult[],
    }
}
