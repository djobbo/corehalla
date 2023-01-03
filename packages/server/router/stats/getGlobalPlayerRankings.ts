import { GLOBAL_PLAYER_RANKINGS_PER_PAGE } from "../../helpers/constants"
import { logInfo } from "logger"
import { numericLiteralValidator } from "common/helpers/validators"
import { publicProcedure } from "../../trpc"
import { supabaseService } from "db/supabase/service"
import { z } from "zod"
import type { BHPlayerData } from "db/generated/client"

export const getGlobalPlayerRankings = publicProcedure
    .input(
        z.object({
            sortBy: z.string(), // TODO: validate with zod
            page: numericLiteralValidator,
        }),
    )
    .output(
        z.array(
            z.object({
                id: z.string(),
                name: z.string(),
                tier: z.string(),
                rating: z.number(),
                peakRating: z.number(),
                region: z.string(),
                prop: z.number(),
            }),
        ),
    )
    .query(async (req) => {
        const { sortBy, page } = req.input
        logInfo("getGlobalPlayerRankings", req.input)

        const query = supabaseService
            .from<BHPlayerData>("BHPlayerData")
            .select(`id,name,tier,rating,region,peakRating,${sortBy}`)
            .order(sortBy as keyof BHPlayerData, { ascending: false }) // TODO: validate prop with zod

        const { data, error } = await query.range(
            (page - 1) * GLOBAL_PLAYER_RANKINGS_PER_PAGE,
            page * GLOBAL_PLAYER_RANKINGS_PER_PAGE - 1,
        )

        if (error) throw error

        // TODO: type check this with zod
        return (
            data?.map(
                // TODO: validate prop with zod
                (playerData) => {
                    const { [sortBy as keyof BHPlayerData]: prop, ...rest } =
                        playerData

                    return {
                        ...(rest as BHPlayerData),
                        prop: prop as number,
                    }
                },
            ) ?? []
        )
    })
