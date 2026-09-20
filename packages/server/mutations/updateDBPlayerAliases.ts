import { logInfo } from "logger"
import { Database, Effect, bhPlayerAlias, runDatabase, sql } from "db/drizzle"
import type { BHPlayerAlias } from "db/schema"
import type { CommonOptions } from "../helpers/commonOptions"

/**
 * Upserts player aliases, de-duplicated on the `(playerId, alias)` primary key.
 *
 * `excluded.*` refers to the row proposed by the insert, which is the same
 * "last write wins" behaviour PostgREST's `upsert` gave us.
 */
export const updateDBPlayerAliases = async (
    aliases: BHPlayerAlias[],
    _options: CommonOptions,
) => {
    const filteredAliases = aliases.filter(
        (alias, i) =>
            aliases.findIndex(
                (a) => a.playerId === alias.playerId && a.alias === alias.alias,
            ) === i,
    )

    logInfo(
        "updateDBPlayerAliases",
        filteredAliases.map((alias) => `${alias.playerId} => ${alias.alias}`),
    )

    if (filteredAliases.length === 0) return

    await runDatabase(
        Effect.gen(function* () {
            const db = yield* Database

            yield* db
                .insert(bhPlayerAlias)
                .values(filteredAliases)
                .onConflictDoUpdate({
                    target: [bhPlayerAlias.playerId, bhPlayerAlias.alias],
                    set: {
                        createdAt: sql`excluded."createdAt"`,
                        public: sql`excluded."public"`,
                    },
                })
        }),
    )
}
