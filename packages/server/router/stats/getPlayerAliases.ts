import { logInfo } from "logger"
import { numericLiteralValidator } from "common/helpers/validators"
import { publicProcedure } from "../../trpc"
import { withTimeLog } from "../../helpers/withTimeLog"
import { z } from "zod"
import {
    Database,
    Effect,
    and,
    bhPlayerAlias,
    desc,
    eq,
    runDatabase,
} from "db/drizzle"

/** Public aliases for a player, newest first. */
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

            return runDatabase(
                Effect.gen(function* () {
                    const db = yield* Database

                    const rows = yield* db
                        .select({ alias: bhPlayerAlias.alias })
                        .from(bhPlayerAlias)
                        .where(
                            and(
                                eq(bhPlayerAlias.playerId, playerId.toString()),
                                eq(bhPlayerAlias.public, true),
                            ),
                        )
                        .orderBy(desc(bhPlayerAlias.createdAt))

                    return rows.map((row) => row.alias)
                }),
            )
        }, "getPlayerAliases"),
    )
