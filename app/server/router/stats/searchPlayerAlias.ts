import { SEARCH_PLAYERS_ALIASES_PER_PAGE } from "@util/constants"
import { numericLiteralValidator } from "common/helpers/validators"
import { publicProcedure } from "../../trpc"
import { supabaseService } from "db/supabase/service"
import { z } from "zod"
import type { BHPlayerAlias } from "db/generated/client"

export const searchPlayerAlias = publicProcedure //
    .input(
        z.object({
            alias: z.string(),
            page: numericLiteralValidator,
        }),
    )
    .query(async (req) => {
        const { alias, page } = req.input
        console.log("searchPlayerAlias", req.input)

        const query = supabaseService
            .from<BHPlayerAlias>("BHPlayerAlias")
            .select("*")
            .order("alias", { ascending: true })
            .match({ alias })

        const { data, error } = await query.range(
            (page - 1) * SEARCH_PLAYERS_ALIASES_PER_PAGE,
            page * SEARCH_PLAYERS_ALIASES_PER_PAGE - 1,
        )

        if (error) throw error

        return data ?? []
    })
