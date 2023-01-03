import { supabaseService } from "db/supabase/service"
import type {
    BHPlayerData,
    BHPlayerLegend,
    BHPlayerWeapon,
} from "db/generated/client"
import type { CommonOptions } from "../helpers/commonOptions"

export const flushOutdatedBPlayerData = async (options: CommonOptions) => {
    const currentTimestamp = new Date().getTime()
    const twoDaysAgo = currentTimestamp - 2 * 24 * 60 * 60 * 1000

    const flushPlayerData = supabaseService
        .from<BHPlayerData>("BHPlayerData")
        .delete()
        .filter("lastUpdated", "not.gt", twoDaysAgo)
        .abortSignal(options.abortSignal)

    const flushLegendData = supabaseService
        .from<BHPlayerLegend>("BHPlayerLegend")
        .delete()
        .filter("lastUpdated", "not.gt", twoDaysAgo)
        .abortSignal(options.abortSignal)

    const flushWeaponData = supabaseService
        .from<BHPlayerWeapon>("BHPlayerWeapon")
        .delete()
        .filter("lastUpdated", "not.gt", twoDaysAgo)
        .abortSignal(options.abortSignal)

    await Promise.all([flushPlayerData, flushLegendData, flushWeaponData])
}
