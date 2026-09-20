import { CLANS_RANKINGS_PER_PAGE } from "../../helpers/constants"
import { logInfo } from "logger"
import { numericLiteralValidator } from "common/helpers/validators"
import { publicProcedure } from "../../trpc"
import { withTimeLog } from "../../helpers/withTimeLog"
import { z } from "zod"
import { Database, Effect, bhClan, desc, ilike, runDatabase } from "db/drizzle"

/**
 * Clan ranking page.
 *
 * The name filter is a bind parameter now, so the PostgREST-era quote escaping
 * is gone.
 */
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

            const trimmed = name.trim()

            return runDatabase(
                Effect.gen(function* () {
                    const db = yield* Database

                    return yield* db
                        .select()
                        .from(bhClan)
                        .where(
                            trimmed.length > 0
                                ? ilike(bhClan.name, `${trimmed}%`)
                                : undefined,
                        )
                        .orderBy(desc(bhClan.xp))
                        .limit(CLANS_RANKINGS_PER_PAGE)
                        .offset((page - 1) * CLANS_RANKINGS_PER_PAGE)
                }),
            )
        }, "getClansRankings"),
    )
