import { logInfo } from "logger"
import { supabaseService } from "db/supabase/service"
import type { BHPlayerAlias } from "db/generated/client"
import type { CommonOptions } from "../helpers/commonOptions"

export const updateDBPlayerAliases = async (
    aliases: BHPlayerAlias[],
    options: CommonOptions,
) => {
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
        .abortSignal(options.abortSignal)
}
