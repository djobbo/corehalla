import { CLANS_RANKINGS_PER_PAGE } from "common/constants"
import { pageStringValidator } from "common/helpers/validators"
import { publicProcedure } from "../../../helpers/trpc"
import { supabaseService } from "db/supabase/service"
import { z } from "zod"
import type { BHClan } from "db/generated/client"

export const getClansRankings = publicProcedure
    .input(
        z.object({
            name: z.string(),
            page: pageStringValidator,
        }),
    )
    .query(async (req) => {
        const { name, page } = req.input
        console.log("getClansRankings", req.input)

        let query = supabaseService
            .from<BHClan>("BHClan")
            .select("*")
            .order("xp", { ascending: false })

        if (name) {
            query = query.textSearch("name", name)
        }

        const { data, error } = await query.range(
            (page - 1) * CLANS_RANKINGS_PER_PAGE,
            page * CLANS_RANKINGS_PER_PAGE - 1,
        )

        if (error) throw error

        // TODO: type check this with zod
        return data
    })
