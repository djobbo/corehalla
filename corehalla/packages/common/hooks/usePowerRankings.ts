import { useQuery } from "react-query"
import axios from "axios"
import type { Bracket } from "bhapi/types"
import type { PR } from "web-parser/power-rankings/parsePowerRankingsPage"
import type { RankedRegion } from "bhapi/constants"
import type { UseQueryOptions } from "react-query"

export const usePowerRankings = (
    bracket: Bracket,
    region: RankedRegion,
    options?: UseQueryOptions<PR[]>,
) => {
    const { data: powerRankings, ...query } = useQuery(
        ["powerRankings", bracket, region],
        async () => {
            const { data } = await axios.get<PR[]>("/api/rankings/power", {
                params: { bracket, region },
            })

            if (!Array.isArray(data))
                throw new Error("Failed to fetch power rankings")
            return data
        },
        options,
    )

    return {
        powerRankings,
        ...query,
    }
}
