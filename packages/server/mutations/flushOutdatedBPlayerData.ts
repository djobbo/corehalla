import {
    Database,
    Effect,
    bhPlayerData,
    bhPlayerLegend,
    bhPlayerWeapon,
    lte,
    runDatabase,
} from "db/drizzle"
import type { CommonOptions } from "../helpers/commonOptions"

/**
 * Deletes player rows that have not been refreshed in the last two days.
 *
 * Replaces the three PostgREST `delete().filter("lastUpdated","not.gt",…)`
 * calls with direct Drizzle deletes. `options.abortSignal` is kept for
 * signature compatibility; the Effect SQL pool owns query cancellation.
 */
export const flushOutdatedBPlayerData = async (_options: CommonOptions) => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)

    await runDatabase(
        Effect.gen(function* () {
            const db = yield* Database

            yield* db
                .delete(bhPlayerData)
                .where(lte(bhPlayerData.lastUpdated, twoDaysAgo))

            yield* db
                .delete(bhPlayerLegend)
                .where(lte(bhPlayerLegend.lastUpdated, twoDaysAgo))

            yield* db
                .delete(bhPlayerWeapon)
                .where(lte(bhPlayerWeapon.lastUpdated, twoDaysAgo))
        }),
    )
}
