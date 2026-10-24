import { Context, Effect, Layer, Schema } from "effect"
import { Cache } from "@crh/core/services/cache"
import { Brawltools } from "./brawltools"
import {
    buildPowerRankings,
    type PowerRankingsInput,
    type PowerRankingsPage,
} from "@crh/domain/power-rankings"
import { PowerRankingsPlayerSchema } from "@crh/api-contract/schemas"
import type { CacheWindow } from "@crh/core/services/cache-policy"
import type { Cached } from "@crh/core/services/cache"
import type { BrawltoolsError } from "@crh/domain/brawltools"

/** Republished rarely — six hours fresh, two days of serve-stale is plenty. */
const powerTtl: CacheWindow = {
    freshSeconds: 6 * 60 * 60,
    staleSeconds: 48 * 60 * 60,
}

/** Cached payload; the schema re-validates KV/L1 hits (see `CacheRead`). */
const PowerRankingsPageSchema = Schema.Struct({
    players: Schema.Array(PowerRankingsPlayerSchema),
    totalPages: Schema.Number,
})

export type PowerRankingsShape = {
    readonly getPowerRankings: (
        input: PowerRankingsInput,
    ) => Effect.Effect<Cached<PowerRankingsPage>, BrawltoolsError>
}

export class PowerRankings extends Context.Service<
    PowerRankings,
    PowerRankingsShape
>()("app/PowerRankings") {}

export const layer = Layer.effect(
    PowerRankings,
    Effect.gen(function* () {
        const brawltools = yield* Brawltools
        const cache = yield* Cache

        return {
            getPowerRankings: (input) =>
                cache.getOrSetCached(
                    `pr:${input.gameMode}:${input.region}:${input.page}:${input.orderBy}`,
                    { ...powerTtl, schema: PowerRankingsPageSchema },
                    buildPowerRankings(brawltools, input),
                ),
        }
    }),
)
