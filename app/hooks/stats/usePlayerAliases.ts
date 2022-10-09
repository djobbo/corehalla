import { supabase } from "db/supabase/client"
import { useQuery } from "react-query"
import type { BHPlayerAlias } from "db/generated/client"

export const usePlayerAliases = (playerId: string) => {
    const { data: playerAliases, ...query } = useQuery(
        ["playerAliases", playerId],
        async () => {
            const { data, error } = await supabase
                .from<BHPlayerAlias>("BHPlayerAlias")
                .select("*")
                .match({ playerId })

            if (error) throw error

            return data.map(({ alias }) => alias)
        },
        { enabled: !!playerId },
    )

    return {
        playerAliases: playerAliases || [],
        ...query,
    }
}
