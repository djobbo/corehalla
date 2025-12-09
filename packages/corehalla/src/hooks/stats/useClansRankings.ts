import { trpc } from "../../util/trpc"

export const useClansRankings = (page: string, name: string) => {
    const { data, ...query } = trpc.getClansRankings.useQuery({
        name,
        page,
    })

    return {
        clans: data ?? [],
        ...query,
    }
}
