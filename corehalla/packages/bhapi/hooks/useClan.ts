import { useQuery } from "react-query"
import axios from "axios"
import type { Clan } from "../types"

export const useClan = (clanId: string) => {
    const { data: clan, ...query } = useQuery(
        ["clanStats", clanId],
        async () => {
            const { data } = await axios.get<Clan>(`/api/stats/clan/${clanId}`)

            if (!data.clan_id) throw new Error("Clan not found")
            return data
        },
        { enabled: !!clanId },
    )

    return {
        clan,
        ...query,
    }
}
