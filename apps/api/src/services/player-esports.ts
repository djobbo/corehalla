import { Context, Effect, Layer } from "effect"
import { Cache } from "@crh/core/services/cache"
import { Brawltools } from "./brawltools"
import { buildPlayerEsports } from "@crh/domain/esports"
import { PlayerEsportsSchema } from "@crh/api-contract/schemas"
import type { CacheWindow } from "@crh/core/services/cache-policy"
import type { Cached } from "@crh/core/services/cache"
import type { BrawltoolsError } from "@crh/domain/brawltools"
import type { PlayerEsports as PlayerEsportsData } from "@crh/api-contract/schemas"

const esportsTtl: CacheWindow = {
    freshSeconds: 6 * 60 * 60,
    staleSeconds: 48 * 60 * 60,
}

export type PlayerEsportsShape = {
    readonly get: (
        brawlhallaId: number,
    ) => Effect.Effect<Cached<PlayerEsportsData>, BrawltoolsError>
}

export class PlayerEsports extends Context.Service<
    PlayerEsports,
    PlayerEsportsShape
>()("app/PlayerEsports") {}

export const layer = Layer.effect(
    PlayerEsports,
    Effect.gen(function* () {
        const brawltools = yield* Brawltools
        const cache = yield* Cache

        return {
            get: (brawlhallaId) =>
                cache.getOrSetCached(
                    `esports:player:${brawlhallaId}`,
                    { ...esportsTtl, schema: PlayerEsportsSchema },
                    buildPlayerEsports(brawltools, brawlhallaId),
                ),
        }
    }),
)
