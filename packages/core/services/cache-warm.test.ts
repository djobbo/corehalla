import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"
import { make } from "./cache"
import { cacheKeys, cacheTtl } from "./cache-policy"
import type { KVNamespaceLike } from "../env"
import type { Ranking1v1 } from "@crh/bhapi/types"

/**
 * The cache-warming contract between the crawler and the request gateway.
 *
 * The crawler does not read through the cache — it is the refresh path, so a
 * cached page would mean never re-reading the ladder — but it writes what it
 * fetched. That only works if both sides agree on the key and the window, and a
 * disagreement is silent: the crawler would warm keys nobody reads and the cache
 * would look cold however much crawling happened.
 *
 * A fake namespace rather than the real binding, so the KV tier is exercised
 * directly. Each `make` gets its own L1 map, so the second instance here is
 * genuinely cold and any hit it takes must have come from KV.
 *
 * Cases that exercise the cache run as effects via `it.effect`, so the Effect
 * runtime owns execution rather than each test calling `runPromise` itself.
 */

const fakeKv = () => {
    const store = new Map<string, string>()

    const kv: KVNamespaceLike = {
        get: async (key) => store.get(key) ?? null,
        put: async (key, value) => {
            store.set(key, value)
        },
        delete: async (key) => {
            store.delete(key)
        },
    }

    return { store, kv }
}

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

                // The crawler's cache instance, and the gateway's — separate L1
                // maps, so the gateway has to go to KV.
                const crawlerCache = make(async () => kv)
                const gatewayCache = make(async () => kv)

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

    it.effect(
        "the stored envelope carries the value and stays fresh",
        () =>
            Effect.gen(function* () {
                const { store, kv } = fakeKv()
                const crawlerCache = make(async () => kv)

                const rows = [row(9)]
                const key = cacheKeys.leaderboard("2v2", "brz", 1)

                yield* crawlerCache.set(key, rows, cacheTtl.leaderboard)

                const envelope = JSON.parse(store.get(key) as string) as {
                    value: unknown
                    freshUntil: number
                }

                expect(envelope.value).toEqual(rows)
                // Fresh, not merely present: a stale write would be re-fetched
                // by the gateway and the crawler's work would buy nothing.
                expect(envelope.freshUntil).toBeGreaterThan(Date.now())
            }),
    )

    it.effect(
        "a stale entry is served when the budget denies the refresh",
        () =>
            Effect.gen(function* () {
                const { kv } = fakeKv()
                const cache = make(async () => kv)

                const key = cacheKeys.player(42)
                const stale = { name: "stale", xp: 1 }

                // Fresh for zero seconds, retained for an hour: stale on
                // arrival.
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
        // The crawler never passes a search term; the gateway omits it for the
        // plain ladder. Those have to be the same key.
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
