import { trpc } from "../../util/trpc"

export const useClan = (clanId: string) => {
    const { data, ...query } = trpc.getClanStats.useQuery({ clanId })

    return {
        clan: data,
        ...query,
    }
}
