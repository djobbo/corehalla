import { SEARCH_PLAYERS_ALIASES_PER_PAGE } from "../../helpers/constants"
import { logInfo } from "logger"
import { numericLiteralValidator } from "common/helpers/validators"
import { publicProcedure } from "../../trpc"
import { withTimeLog } from "../../helpers/withTimeLog"
import { z } from "zod"
import { Database, Effect, runDatabase, sql } from "db/drizzle"
import type { BHPlayerAlias } from "db/schema"

type AliasSearchResult = {
    playerId: string
    mainAlias: string
    otherAliases: string[]
}

/**
 * Alias search backed by the `search_aliases` SQL function in
 * `packages/db/sql/functions.sql`. Replaces the PostgREST `rpc` call.
 */
export const searchPlayerAlias = publicProcedure //
    .input(
        z.object({
            alias: z.string(),
            page: numericLiteralValidator,
        }),
    )
    .query(
        withTimeLog(async (req) => {
            const { alias, page } = req.input
            logInfo("searchPlayerAlias", req.input)

            if (alias.length < 2) {
                return []
            }

            return runDatabase(
                Effect.gen(function* () {
                    const db = yield* Database

                    const rows = yield* db.execute<BHPlayerAlias>(
                        sql`
                            select * from search_aliases(
                                ${alias.trim()},
                                ${(page - 1) * SEARCH_PLAYERS_ALIASES_PER_PAGE},
                                ${SEARCH_PLAYERS_ALIASES_PER_PAGE}
                            )
                        `,
                        "objects",
                    )

                    return rows.reduce((acc, row) => {
                        const player = acc.find(
                            (a) => a.playerId === row.playerId,
                        )

                        if (!player) {
                            acc.push({
                                playerId: row.playerId,
                                mainAlias: row.alias,
                                otherAliases: [],
                            })

                            return acc
                        }

                        if (player.mainAlias !== row.alias) {
                            player.otherAliases.push(row.alias)
                        }

                        return acc
                    }, [] as AliasSearchResult[])
                }),
            )
        }, "searchPlayerAlias"),
    )
