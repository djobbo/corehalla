// import { useQuery } from "react-query"
import { useRankings1v1 } from "../useRankings"
// import axios from "axios"
// import type { BHPlayerAlias } from "db/generated/client"

export const usePlayerSearch = (search: string) => {
    const { rankings1v1, isLoading } = useRankings1v1("all", "1", search, {
        enabled: !!search,
    })
    // const { data: aliases } = useQuery(
    //     ["player-search", search],
    //     async () => {
    //         const { data } = await axios.get<BHPlayerAlias[]>(
    //             "/api/rankings/search/player",
    //             {
    //                 params: { search },
    //             },
    //         )

    //         if (!Array.isArray(data))
    //             throw new Error("Failed to fetch rankings")
    //         return data
    //     },
    //     { enabled: !!search },
    // )

    return {
        rankings1v1,
        isLoading,
        aliases: [],
    }
}
