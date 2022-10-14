import { useQuery } from "react-query"
import axios from "axios"
import type { BHClan } from "db/generated/client"

export const useClansRankings = (page = "1", name = "") => {
    const { data: clans, ...query } = useQuery(
        ["clansRankings", page, name],
        async () => {
            const { data } = await axios.get<BHClan[]>(`/api/rankings/clans`, {
                params: {
                    page,
                    name,
                },
            })

            if (!data) throw new Error("No data")

            return data
        },
    )

    return {
        clans: clans ?? [],
        ...query,
    }
}
