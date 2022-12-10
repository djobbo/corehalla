import { trpc } from "@util/trpc"
import { useRankings1v1 } from "./useRankings"

export const usePlayerSearch = (search: string) => {
    const { rankings1v1, isLoading } = useRankings1v1("all", "1", search, {
        enabled: !!search,
    })
    const { data: aliases } = trpc.searchPlayerAlias.useQuery(
        { alias: search, page: "1" },
        { enabled: !!search },
    )

    return {
        rankings1v1,
        isLoading,
        aliases: aliases ?? [],
    }
}
