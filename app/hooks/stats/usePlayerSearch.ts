import { trpc } from "@util/trpc"

export const usePlayerSearch = (search: string) => {
    // BMG DB Destroyer 🤦
    // const { rankings1v1, isLoading } = useRankings1v1("all", "1", search, {
    //     enabled: !!search,
    // })
    const { data: aliases, isLoading } = trpc.searchPlayerAlias.useQuery(
        { alias: search, page: "1" },
        { enabled: !!search },
    )

    return {
        rankings1v1: [],
        isLoading,
        aliases: aliases ?? [],
    }
}
