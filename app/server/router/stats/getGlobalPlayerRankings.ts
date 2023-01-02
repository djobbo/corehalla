import { GLOBAL_PLAYER_RANKINGS_PER_PAGE } from "@util/constants"
import { logInfo } from "@ch/logger"
import { numericLiteralValidator } from "@ch/common/helpers/validators"
import { publicProcedure } from "@server/trpc"
import { supabaseService } from "@ch/db/supabase/service"
import { z } from "zod"
import type { BHPlayerData } from "@ch/db/generated/client"

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
