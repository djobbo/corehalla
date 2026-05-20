import type { BHClan } from "db/generated/client"
import { supabaseService } from "db/supabase/service"
import { logInfo } from "logger"

import type { CommonOptions } from "../helpers/commonOptions"

export const updateDBClanData = async (
    clan: Partial<BHClan>,
    options: CommonOptions,
) => {
    logInfo("updateDBClanData", { clanId: clan.id })

    await supabaseService
        .from<BHClan>("BHClan")
        .upsert(clan)
        .abortSignal(options.abortSignal)
}
