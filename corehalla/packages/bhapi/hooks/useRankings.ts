import { useQuery } from "react-query"
import axios from "axios"
import type { Bracket, Region } from "bhapi"
import type { Ranking1v1 } from "bhapi/types"

const useRankings = <T>(
    bracket: Bracket,
    region: Region,
    page: string,
    name?: string,
) => {
    return useQuery(["rankings", bracket, region, page, name], async () => {
        const { data } = await axios.get<T>("/api/rankings", {
            params: { bracket, region, page, name },
        })

        if (!Array.isArray(data)) throw new Error("Failed to fetch rankings")
        return data
    })
}

export const useRankings1v1 = (region: Region, page: string, name?: string) => {
    const { data: rankings1v1, ...query } = useRankings<Ranking1v1[]>(
        "1v1",
        region,
        page,
        name,
    )

    return {
        rankings1v1,
        ...query,
    }
}

export const useRankings2v2 = (region: Region, page: string, name?: string) => {
    const { data: rankings2v2, ...query } = useRankings<Ranking1v1[]>(
        "2v2",
        region,
        page,
        name,
    )

    return {
        rankings2v2,
        ...query,
    }
}
