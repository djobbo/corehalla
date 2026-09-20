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
            .from("BHPlayerData")
            .select(`id,name,tier,rating,region,peakRating,${sortBy}`)
            .order(sortBy as keyof BHPlayerData, { ascending: false }) // TODO: validate prop with zod

        const { data, error } = await query.range(
            (page - 1) * GLOBAL_PLAYER_RANKINGS_PER_PAGE,
            page * GLOBAL_PLAYER_RANKINGS_PER_PAGE - 1,
        )

        if (error) throw error

        // The select list is interpolated, so it is not a literal type and the
        // client cannot infer the projected row shape. The table's row type is
        // the contract here.
        const rows = (data ?? []) as unknown as BHPlayerData[]

        // TODO: type check this with zod
        return rows.map(
            // TODO: validate prop with zod
            (playerData) => {
                // The sorted column is dynamic, so it is projected out through
                // an index signature: computed-key destructuring on the concrete
                // row type is not representable.
                const { [sortBy]: prop, ...rest } = playerData as Record<
                    string,
                    unknown
                >

                return {
                    ...(rest as unknown as BHPlayerData),
                    prop: prop as number,
                }
            },
        )
    })
