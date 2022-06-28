import { useQuery } from "react-query"
import axios from "axios"
import type { Bracket, Ranking1v1, Ranking2v2 } from "bhapi/types"
import type { RankedRegion } from "bhapi/constants"
import type { UseQueryOptions } from "react-query"

const useRankings = <T>(
    bracket: Bracket,
    region: RankedRegion,
    page: string,
    name?: string,
    options?: UseQueryOptions<T>,
) => {
    return useQuery(
        ["rankings", bracket, region, page, name],
        async () => {
            const { data } = await axios.get<T>("/api/rankings", {
                params: { bracket, region, page, name },
            })

            if (!Array.isArray(data))
                throw new Error("Failed to fetch rankings")
            return data
        },
        options,
    )
}

export const useRankings1v1 = (
    region: RankedRegion,
    page: string,
    name = "",
    options: UseQueryOptions<Ranking1v1[]> = {},
) => {
    const { data: rankings1v1, ...query } = useRankings<Ranking1v1[]>(
        "1v1",
        region,
        page,
        name,
        options,
    )

    return {
        rankings1v1,
        ...query,
    }
}

export const useRankings2v2 = (
    region: RankedRegion,
    page: string,
    options: UseQueryOptions<Ranking2v2[]> = {},
) => {
    const { data: rankings2v2, ...query } = useRankings<Ranking2v2[]>(
        "2v2",
        region,
        page,
        "",
        options,
    )

    return {
        rankings2v2,
        ...query,
    }
}
