import { supabaseService } from "db/supabase/service"
import type {
    BHPlayerData,
    BHPlayerLegend,
    BHPlayerWeapon,
} from "db/generated/client"

export const flushOutdatedBPlayerData = async () => {
    const currentTimestamp = new Date().getTime()
    const twoDaysAgo = currentTimestamp - 2 * 24 * 60 * 60 * 1000

    const flushPlayerData = supabaseService
        .from<BHPlayerData>("BHPlayerData")
        .delete()
        .filter("lastUpdated", "not.gt", twoDaysAgo)

    const flushLegendData = supabaseService
        .from<BHPlayerLegend>("BHPlayerLegend")
        .delete()
        .filter("lastUpdated", "not.gt", twoDaysAgo)

    const flushWeaponData = supabaseService
        .from<BHPlayerWeapon>("BHPlayerWeapon")
        .delete()
        .filter("lastUpdated", "not.gt", twoDaysAgo)

    await Promise.all([flushPlayerData, flushLegendData, flushWeaponData])
}
