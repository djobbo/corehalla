import { GLOBAL_PLAYER_RANKINGS_PER_PAGE } from "../../helpers/constants"
import { logInfo } from "logger"
import { numericLiteralValidator } from "common/helpers/validators"
import { publicProcedure } from "../../trpc"
import { z } from "zod"
import {
    Database,
    Effect,
    bhPlayerData,
    desc,
    getTableColumns,
    runDatabase,
} from "db/drizzle"

/**
 * Global player ranking page.
 *
 * The sortable column is dynamic, so it is looked up in the table's column map
 * (the HTTP layer validates `sortBy` against the `SortablePlayerProp` literals)
 * rather than interpolating an identifier into SQL.
 */
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

        return runDatabase(
            Effect.gen(function* () {
                const db = yield* Database
                const playerColumns = getTableColumns(bhPlayerData)
                const column =
                    playerColumns[sortBy as keyof typeof playerColumns]

                if (!column) {
                    throw new Error(`Unknown sort column: ${sortBy}`)
                }

                const rows = yield* db
                    .select({
                        id: bhPlayerData.id,
                        name: bhPlayerData.name,
                        tier: bhPlayerData.tier,
                        rating: bhPlayerData.rating,
                        region: bhPlayerData.region,
                        peakRating: bhPlayerData.peakRating,
                        prop: column,
                    })
                    .from(bhPlayerData)
                    .orderBy(desc(column))
                    .limit(GLOBAL_PLAYER_RANKINGS_PER_PAGE)
                    .offset((page - 1) * GLOBAL_PLAYER_RANKINGS_PER_PAGE)

                // Every sortable property is an integer column, so the union of
                // column value types narrows to `number`.
                return rows.map((row) => ({
                    ...row,
                    prop: row.prop as number,
                }))
            }),
        )
    })
