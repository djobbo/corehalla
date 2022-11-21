import { supabaseService } from "db/supabase/service"
import type { BHClan } from "db/generated/client"

export const updateDBClanData = async (clan: BHClan) => {
    console.log("updateDBClanData", { clanId: clan.id })

    await supabaseService.from<BHClan>("BHClan").upsert(clan)
}
