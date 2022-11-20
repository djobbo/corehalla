import { trpc } from "@util/trpc"

export const useClansRankings = (page: string, name: string) => {
    const { data, ...query } = trpc.v1.rankings.getClansRankings.useQuery({
        name,
        page,
    })

    return {
        clans: data ?? [],
        ...query,
    }
}
