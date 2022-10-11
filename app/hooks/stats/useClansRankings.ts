import { useQuery } from "react-query"
import axios from "axios"
import type { Clan } from "bhapi/types"

export const useClansRankings = (page = "1", name = "") => {
    const { data: clans, ...query } = useQuery(
        ["clansRankings", page, name],
        async () => {
            const { data } = await axios.get<Omit<Clan, "clan">[]>(
                `/api/clans/${page}`,
                {
                    params: {
                        name,
                    },
                },
            )

            if (!data) throw new Error("No data")

            return data
        },
    )

    return {
        clans: clans ?? [],
        ...query,
    }
}
