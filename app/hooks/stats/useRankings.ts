import { trpc } from "@util/trpc"
import type { RankedRegion } from "bhapi/constants"

export const useRankings1v1 = (
    region: RankedRegion,
    page: string,
    name = "",
    options: { enabled?: boolean } = {},
) => {
    const { data, ...query } = trpc.get1v1Rankings.useQuery(
        {
            region,
            page,
            name,
        },
        options,
    )

    return {
        rankings1v1: data,
        ...query,
    }
}

export const useRankings2v2 = (region: RankedRegion, page: string) => {
    const { data, ...query } = trpc.get2v2Rankings.useQuery({
        region,
        page,
    })

    return {
        rankings2v2: data,
        ...query,
    }
}
