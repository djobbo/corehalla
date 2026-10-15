import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"
import { make } from "./cache"
import { cacheKeys, cacheTtl, emptyTtl } from "./cache-policy"
import type { KVNamespaceLike } from "../env"
import type { Ranking1v1 } from "@crh/bhapi/types"

const fakeKv = () => {
    const store = new Map<string, string>()

    const kv: KVNamespaceLike = {
        get: async (key) => store.get(key) ?? null,
        async put(key, value) {
            store.set(key, value)
        },
        async delete(key) {
            store.delete(key)
        },
    }

    return { store, kv }
}

const inlineSchedule = (effect: Effect.Effect<unknown, unknown>) =>
    effect.pipe(Effect.orDie, Effect.asVoid)

const row = (id: number): Ranking1v1 => ({
    rank: id,
    rating: 2000 + id,
    peak_rating: 2100 + id,
    tier: "Diamond",
    games: 100,
    wins: 60,
    region: "eu",
    name: `player-${id}`,
    brawlhalla_id: id,
    best_legend: 0,
    best_legend_games: 0,
    best_legend_wins: 0,
})

describe("crawler -> gateway cache warming", () => {
    it.effect(
        "a page the crawler fetched is served to a cold gateway without a fetch",
        () =>
            Effect.gen(function* () {
                const { store, kv } = fakeKv()

                const crawlerCache = make(async () => kv, inlineSchedule)
                const gatewayCache = make(async () => kv, inlineSchedule)

                const rows = [row(1), row(2), row(3)]
                const key = cacheKeys.leaderboard("1v1", "eu", 7)

                yield* crawlerCache.set(key, rows, cacheTtl.leaderboard)

                expect(store.has(key)).toBe(true)

                let fetched = false

                const served = yield* gatewayCache.getOrSet(
                    key,
                    cacheTtl.leaderboard,
                    Effect.sync(() => {
                        fetched = true

                        return []
                    }),
                )

                expect(served).toEqual(rows)
                expect(fetched).toBe(false)
            }),
    )

    it.effect("the stored envelope carries the value and stays fresh", () =>
        Effect.gen(function* () {
            const { store, kv } = fakeKv()
            const crawlerCache = make(async () => kv, inlineSchedule)

            const rows = [row(9)]
            const key = cacheKeys.leaderboard("2v2", "brz", 1)

            yield* crawlerCache.set(key, rows, cacheTtl.leaderboard)

            const envelope = JSON.parse(store.get(key) as string) as {
                value: unknown
                freshUntil: number
            }

            expect(envelope.value).toEqual(rows)
            expect(envelope.freshUntil).toBeGreaterThan(Date.now())
        }),
    )

    it.effect(
        "a stale entry is served when the budget denies the refresh",
        () =>
            Effect.gen(function* () {
                const { kv } = fakeKv()
                const cache = make(async () => kv, inlineSchedule)

                const key = cacheKeys.playerStats(42)
                const stale = { name: "stale", xp: 1 }

                yield* cache.set(key, stale, {
                    freshSeconds: 0,
                    staleSeconds: 3600,
                })

                let fetched = false

                const served = yield* cache.getOrSet(
                    key,
                    { freshSeconds: 0, staleSeconds: 3600 },
                    Effect.sync(() => {
                        fetched = true

                        return { name: "fresh", xp: 2 }
                    }),
                    Effect.succeed(false),
                )

                expect(served).toEqual(stale)
                expect(fetched).toBe(false)
            }),
    )

    it("an unfiltered page shares one key across both sides", () => {
        expect(cacheKeys.leaderboard("1v1", "eu", 3)).toBe(
            cacheKeys.leaderboard("1v1", "eu", 3, undefined),
        )
        expect(cacheKeys.leaderboard("1v1", "eu", 3, "")).toBe(
            cacheKeys.leaderboard("1v1", "eu", 3),
        )

        // A search result is a different page and must not collide with it.
        expect(cacheKeys.leaderboard("1v1", "eu", 3, "boom")).not.toBe(
            cacheKeys.leaderboard("1v1", "eu", 3),
        )
    })

    it("each ladder and page is its own key", () => {
        const keys = [
            cacheKeys.leaderboard("1v1", "eu", 1),
            cacheKeys.leaderboard("1v1", "eu", 2),
            cacheKeys.leaderboard("1v1", "brz", 1),
            cacheKeys.leaderboard("2v2", "eu", 1),
        ]

        expect(new Set(keys).size).toBe(keys.length)
    })
})

describe("the freshness outcomes", () => {
    const staleButRetained = { freshSeconds: 0, staleSeconds: 3600 }

    const envelopeOf = (store: Map<string, string>, key: string) =>
        JSON.parse(store.get(key) as string) as {
            value: unknown
            freshUntil: number
        }

    it.effect("a fresh entry is answered without a fetch", () =>
        Effect.gen(function* () {
            const { kv } = fakeKv()
            const cache = make(async () => kv, inlineSchedule)
            const key = cacheKeys.playerStats(1)

            yield* cache.set(key, { name: "current" }, cacheTtl.profile)

            let fetched = false

            const served = yield* cache.getOrSet(
                key,
                cacheTtl.profile,
                Effect.sync(() => {
                    fetched = true

                    return { name: "refetched" }
                }),
            )

            expect(served).toEqual({ name: "current" })
            expect(fetched).toBe(false)
        }),
    )

    it.effect(
        "a stale entry is answered now and refreshed behind the response",
        () =>
            Effect.gen(function* () {
                const { store, kv } = fakeKv()
                const key = cacheKeys.playerStats(2)
                const stale = { name: "stale", xp: 1 }
                const current = { name: "current", xp: 2 }

                let scheduled: Effect.Effect<void> | null = null

                const cache = make(
                    async () => kv,
                    (effect) =>
                        Effect.sync(() => {
                            scheduled = effect as Effect.Effect<void>
                        }),
                )

                yield* cache.set(key, stale, staleButRetained)

                let fetched = false

                const served = yield* cache.getOrSet(
                    key,
                    cacheTtl.profile,
                    Effect.sync(() => {
                        fetched = true

                        return current
                    }),
                )

                expect(served).toEqual(stale)
                // ...before the refresh has run at all.
                expect(fetched).toBe(false)
                expect(scheduled).not.toBeNull()

                yield* scheduled!
                expect(fetched).toBe(true)
                expect(envelopeOf(store, key).value).toEqual(current)
            }),
    )

    it.effect(
        "a stale entry past its retention window is refetched for the caller",
        () =>
            Effect.gen(function* () {
                const { kv } = fakeKv()
                const cache = make(async () => kv, inlineSchedule)
                const key = cacheKeys.playerStats(3)

                yield* cache.set(
                    key,
                    { name: "ancient" },
                    {
                        freshSeconds: 0,
                        staleSeconds: 0,
                    },
                )

                const reader = make(async () => kv, inlineSchedule)

                const served = yield* reader.getOrSet(
                    key,
                    cacheTtl.profile,
                    Effect.succeed({ name: "current" }),
                )

                expect(served).toEqual({ name: "current" })
            }),
    )

    it.effect(
        "a refresh that finds nothing is stored on the empty window",
        () =>
            Effect.gen(function* () {
                const { store, kv } = fakeKv()
                const cache = make(async () => kv, inlineSchedule)
                const key = cacheKeys.playerStats(4)

                yield* cache.set(key, { name: "stale" }, staleButRetained)

                const served = yield* cache.getOrSet(
                    key,
                    cacheTtl.profile,
                    Effect.succeed(null),
                )

                expect(served).toEqual({ name: "stale" })

                const envelope = envelopeOf(store, key)

                expect(envelope.value).toBeNull()
                expect(envelope.freshUntil - Date.now()).toBeLessThanOrEqual(
                    emptyTtl.freshSeconds * 1000,
                )
            }),
    )
})

describe("caching an absent answer", () => {
    const envelopeOf = (store: Map<string, string>, key: string) =>
        JSON.parse(store.get(key) as string) as {
            value: unknown
            freshUntil: number
        }

    it.effect(
        "a null is stored on the empty window rather than the resource's own",
        () =>
            Effect.gen(function* () {
                const { store, kv } = fakeKv()
                const cache = make(async () => kv, inlineSchedule)
                const key = cacheKeys.playerStats(999)

                yield* cache.getOrSet(
                    key,
                    cacheTtl.profile,
                    Effect.succeed(null),
                )

                const envelope = envelopeOf(store, key)

                expect(envelope.value).toBeNull()

                expect(envelope.freshUntil - Date.now()).toBeLessThanOrEqual(
                    emptyTtl.freshSeconds * 1000,
                )
            }),
    )

    it.effect("an empty board is stored on the empty window too", () =>
        Effect.gen(function* () {
            const { store, kv } = fakeKv()
            const cache = make(async () => kv, inlineSchedule)
            const key = cacheKeys.leaderboard("1v1", "eu", 1)

            yield* cache.getOrSet(
                key,
                cacheTtl.leaderboard,
                Effect.succeed([] as readonly Ranking1v1[]),
            )

            const envelope = envelopeOf(store, key)

            expect(envelope.value).toEqual([])

            expect(envelope.freshUntil - Date.now()).toBeLessThanOrEqual(
                emptyTtl.freshSeconds * 1000,
            )
        }),
    )

    it.effect("a real value still gets the window its resource asked for", () =>
        Effect.gen(function* () {
            const { store, kv } = fakeKv()
            const cache = make(async () => kv, inlineSchedule)
            const key = cacheKeys.playerStats(1)

            yield* cache.getOrSet(
                key,
                cacheTtl.profile,
                Effect.succeed({ name: "Lopes", xp: 10 }),
            )

            expect(
                envelopeOf(store, key).freshUntil - Date.now(),
            ).toBeGreaterThan(emptyTtl.freshSeconds * 1000)
        }),
    )
})
