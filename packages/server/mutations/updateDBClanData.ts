import { logInfo } from "logger"
import { Database, Effect, bhClan, runDatabase } from "db/drizzle"
import type { NewBHClan } from "db/schema"
import type { CommonOptions } from "../helpers/commonOptions"

/**
 * Upserts a clan row. Replaces the PostgREST `upsert` with Drizzle's
 * `onConflictDoUpdate`, so the refreshed columns are spelled out explicitly.
 */
export const updateDBClanData = async (
    clan: NewBHClan,
    _options: CommonOptions,
) => {
    logInfo("updateDBClanData", { clanId: clan.id })

    await runDatabase(
        Effect.gen(function* () {
            const db = yield* Database

            yield* db
                .insert(bhClan)
                .values(clan)
                .onConflictDoUpdate({
                    target: bhClan.id,
                    set: {
                        name: clan.name,
                        xp: clan.xp,
                        ...(clan.created === undefined
                            ? {}
                            : { created: clan.created }),
                    },
                })
        }),
    )
}
