import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer } from "effect"
import type { Context } from "effect"
import { Brawlhalla, Upstream, layer as gatewayLayer } from "./index"
import { Database } from "../archive"
import { inlineLayer, layer as backgroundLayer } from "../background"
import { layerFrom as cacheLayer } from "../cache"
import { playerStatsMock } from "@crh/bhapi/mocks/playerStats"
import type { KVNamespaceLike } from "../../env"

/**
 * Where the archive write sits, and how often it runs.
 *
 * The player tables are written from the *refresh* path rather than the read
 * path. Putting it on the read path — as it was — meant the write ran on every
 * request, cache hit or not: a popular profile would issue a full upsert (a
 * player row, three legends and three weapons) once per view, for data the
 * archive already held. That is the difference between one write per five
 * minutes and one per reader, and it is invisible in a passing request because
 * the cost lands on the database rather than on the response.
 *
 * `inlineLayer` is used deliberately: it runs background work on the calling
 * fiber, so the assertions below can be made without racing the write. The
 * detachment itself is `background.test.ts`'s subject.
 */

const fakeKv = (): KVNamespaceLike => {
    const store = new Map<string, string>()

    return {
        get: async (key) => store.get(key) ?? null,
        put: async (key, value) => {
            store.set(key, value)
        },
        delete: async (key) => {
            store.delete(key)
        },
    }
}

const fakeUpstream = (calls: { count: number }) =>
    Layer.succeed(Upstream, {
        /*
         * Only the method under test. A full `Upstream` stand-in would be
         * twenty lines of unused stubs, and the cast is what keeps the test
         * about the one call path it exercises.
         */
        getPlayerStats: () =>
            Effect.sync(() => {
                calls.count += 1

                return playerStatsMock
            }),
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

            // The second view is served from the cache, so upstream is read
            // once...
            expect(upstreamCalls.count).toBe(1)

            // ...and so is the archive. This is the assertion the old placement
            // would fail: it wrote on both views.
            expect(writes.count).toBe(1)
        }),
    )

    it.effect("still writes when the cache is cold", () =>
        Effect.gen(function* () {
            const upstreamCalls = { count: 0 }
            const writes = { count: 0 }

            const gateway = gatewayWith(upstreamCalls, writes)

            // Two separate gateway builds, so the second starts with no cache
            // at all — the "different reader, five minutes later" case.
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
                        // `null` is "we could not read this", not "no such
                        // player". Storing it would erase whatever the crawler
                        // had recorded.
                        getPlayerStats: () => Effect.succeed(null),
                    } as unknown as Context.Service.Shape<typeof Upstream>),
                ),
                Layer.provide(fakeDatabase(writes)),
                Layer.provide(backgroundLayer),
            )

            const stats = yield* Brawlhalla.pipe(
                Effect.flatMap((brawlhalla) => brawlhalla.getPlayerStats(1)),
                Effect.provide(gateway),
            )

            expect(stats).toBeNull()
            expect(writes.count).toBe(0)
            expect(upstreamCalls.count).toBe(0)
        }),
    )
})
