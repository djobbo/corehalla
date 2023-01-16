import { CLANS_RANKINGS_PER_PAGE } from "../../helpers/constants"
import { logInfo } from "logger"
import { numericLiteralValidator } from "common/helpers/validators"
import { publicProcedure } from "../../trpc"
import { supabaseService } from "db/supabase/service"
import { withTimeLog } from "../../helpers/withTimeLog"
import { z } from "zod"
import type { BHClan } from "db/generated/client"

export const getClansRankings = publicProcedure
    .input(
        z.object({
            name: z.string(),
            page: numericLiteralValidator,
        }),
    )
    .query(
        withTimeLog(async (req) => {
            const { name, page } = req.input
            logInfo("getClansRankings", req.input)

            let query = supabaseService.from<BHClan>("BHClan").select("*")

            const cleanName = name.trim().replace(/'/g, "\\'")

            if (cleanName.length > 0) {
                query = query.ilike("name", `${cleanName}%`)
            } else {
                query = query.select("*")
            }

            const { data, error } = await query
                .order("xp", { ascending: false })
                .range(
                    (page - 1) * CLANS_RANKINGS_PER_PAGE,
                    page * CLANS_RANKINGS_PER_PAGE - 1,
                )

            if (error) {
                throw error
            }

            // TODO: type check this with zod
            return data
        }, "getClansRankings"),
    )
