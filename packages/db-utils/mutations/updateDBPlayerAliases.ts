import { logInfo } from "@ch/logger"
import { supabaseService } from "@ch/db/supabase/service"
import type { BHPlayerAlias } from "@ch/db/generated/client"

export const updateDBPlayerAliases = async (aliases: BHPlayerAlias[]) => {
    const filteredAliases = aliases.filter(
        (alias, i) =>
            aliases.findIndex(
                (a) => a.playerId === alias.playerId && a.alias === alias.alias,
            ) === i,
    )

    logInfo(
        "updateDBPlayerAliases",
        filteredAliases.map((alias) => `${alias.playerId} => ${alias.alias}`),
    )

    await supabaseService //
        .from<BHPlayerAlias>("BHPlayerAlias")
        .upsert(filteredAliases)
}
