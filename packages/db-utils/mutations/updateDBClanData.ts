import { logInfo } from "@ch/logger"
import { supabaseService } from "@ch/db/supabase/service"
import type { BHClan } from "@ch/db/generated/client"

export const updateDBClanData = async (clan: Partial<BHClan>) => {
    logInfo("updateDBClanData", { clanId: clan.id })

    await supabaseService.from<BHClan>("BHClan").upsert(clan)
}
