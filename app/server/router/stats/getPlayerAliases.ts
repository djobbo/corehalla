import { logInfo } from "@ch/logger"
import { numericLiteralValidator } from "@ch/common/helpers/validators"
import { publicProcedure } from "@server/trpc"
import { supabaseService } from "@ch/db/supabase/service"
import { withTimeLog } from "@server/helpers/withTimeLog"
import { z } from "zod"
import type { BHPlayerAlias } from "@ch/db/generated/client"

export const getPlayerAliases = publicProcedure //
    .input(
        z.object({
            playerId: numericLiteralValidator,
        }),
    )
    .query(
        withTimeLog(async (req) => {
            const { playerId } = req.input
            logInfo("getPlayerAliases", req.input)

            const { data, error } = await supabaseService
                .from<BHPlayerAlias>("BHPlayerAlias")
                .select("*")
                .match({ playerId })

            if (error) throw error

            return data.map((alias) => alias.alias)
        }, "getPlayerAliases"),
    )
