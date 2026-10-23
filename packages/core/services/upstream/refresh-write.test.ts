import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer } from "effect"
import type { Context } from "effect"
import { Brawlhalla, Upstream, layer as gatewayLayer } from "./index"
import { Database } from "../archive"
import { inlineLayer, layer as backgroundLayer } from "../background"
import { layerFrom as cacheLayer } from "../cache"
import { playerStatsMock } from "@crh/bhapi/mocks/playerStats"
import type { KVNamespaceLike } from "../../env"

const fakeKv = (): KVNamespaceLike => {
    const store = new Map<string, string>()

    return {
        get: async (key) => store.get(key) ?? null,
        async put(key, value) {
            store.set(key, value)
        },
        async delete(key) {
            store.delete(key)
        },
    }
}

const fakeUpstream = (calls: { count: number }) =>
    Layer.succeed(Upstream, {
        getPlayerStats: () =>
            Effect.sync(() => {
                calls.count += 1

                return playerStatsMock
            }),
        getPlayerClan: () => Effect.succeed(null),
    } as unknown as Context.Service.Shape<typeof Upstream>)

const fakeDatabase = (writes: { count: number }) =>
    Layer.succeed(Database, {
        upsertPlayerStats: () =>
            Effect.sync(() => {
                writes.count += 1
            }),
    } as unknown as Context.Service.Shape<typeof Database>)

const gatewayWith = (
    upstreamCalls: { count: number },
    writes: { count: number },
) =>
    gatewayLayer.pipe(
        Layer.provide(cacheLayer(async () => fakeKv())),
        Layer.provide(fakeUpstream(upstreamCalls)),
        Layer.provide(fakeDatabase(writes)),
        Layer.provide(inlineLayer),
    )

describe("the archive write on a player refresh", () => {
    it.effect("runs once for two views of the same player", () =>
        Effect.gen(function* () {
            const upstreamCalls = { count: 0 }
            const writes = { count: 0 }

            const viewed = Effect.gen(function* () {
                const brawlhalla = yield* Brawlhalla

                const first = yield* brawlhalla.getPlayerStats(1)
                const second = yield* brawlhalla.getPlayerStats(1)

                expect(second).toEqual(first)
            }).pipe(Effect.provide(gatewayWith(upstreamCalls, writes)))

            yield* viewed

            expect(upstreamCalls.count).toBe(1)

            expect(writes.count).toBe(1)
        }),
    )

    it.effect("still writes when the cache is cold", () =>
        Effect.gen(function* () {
            const upstreamCalls = { count: 0 }
            const writes = { count: 0 }

            const gateway = gatewayWith(upstreamCalls, writes)

            yield* Brawlhalla.pipe(
                Effect.flatMap((brawlhalla) => brawlhalla.getPlayerStats(1)),
                Effect.provide(gateway),
            )
            yield* Brawlhalla.pipe(
                Effect.flatMap((brawlhalla) => brawlhalla.getPlayerStats(1)),
                Effect.provide(gatewayWith(upstreamCalls, writes)),
            )

            expect(upstreamCalls.count).toBe(2)
            expect(writes.count).toBe(2)
        }),
    )

    it.effect("does not write when the upstream could not answer", () =>
        Effect.gen(function* () {
            const upstreamCalls = { count: 0 }
            const writes = { count: 0 }

            const gateway = gatewayLayer.pipe(
                Layer.provide(cacheLayer(async () => fakeKv())),
                Layer.provide(
                    Layer.succeed(Upstream, {
                        getPlayerStats: () => Effect.succeed(null),
                        getPlayerClan: () => Effect.succeed(null),
                    } as unknown as Context.Service.Shape<typeof Upstream>),
                ),
                Layer.provide(fakeDatabase(writes)),
                Layer.provide(backgroundLayer),
            )

            const stats = yield* Brawlhalla.pipe(
                Effect.flatMap((brawlhalla) => brawlhalla.getPlayerStats(1)),
                Effect.provide(gateway),
            )

            expect(stats.value).toBeNull()
            expect(writes.count).toBe(0)
            expect(upstreamCalls.count).toBe(0)
        }),
    )
})
