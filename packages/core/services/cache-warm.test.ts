import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"
import { make } from "./cache"
import { cacheKeys, cacheTtl, emptyTtl } from "./cache-policy"
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
        async put(key, value) {
            store.set(key, value)
        },
        async delete(key) {
            store.delete(key)
        },
    }

    return { store, kv }
}

/**
 * A scheduler that runs a background refresh on the caller's own fiber.
 *
 * Production hands the refresh to `Background`, which detaches it and keeps the
 * isolate alive with `waitUntil`; running it inline here makes the ordering
 * deterministic — the stale value is returned, and whatever the refresh wrote
 * has landed by the time the assertion runs. The detachment itself is
 * `background.test.ts`'s subject.
 */
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

                // The crawler's cache instance, and the gateway's — separate L1
                // maps, so the gateway has to go to KV.
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
                const cache = make(async () => kv, inlineSchedule)

                const key = cacheKeys.playerStats(42)
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

/**
 * The three outcomes the freshness/retention split produces.
 *
 * A fresh entry is answered and nothing else happens. A stale entry inside its
 * retention window is answered *now* and refreshed behind the response, so the
 * wait lands on nobody. An entry past retention — or no entry at all — has
 * nothing to answer with, so the caller waits for the fetch. The middle case is
 * the new one; the retention boundary is what keeps it from swallowing the
 * third.
 */
describe("the freshness outcomes", () => {
    /**
     * Stale on arrival but retained for an hour: fresh for zero seconds is the
     * shortest way to be past `freshUntil` without being past `staleUntil`.
     */
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

                /*
                 * The scheduled effect is captured rather than run, so the test
                 * can prove it had not run by the time the caller was answered.
                 * Production's scheduler detaches for real — see `Background`.
                 */
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

                // The response leaves with the stale value...
                expect(served).toEqual(stale)
                // ...before the refresh has run at all.
                expect(fetched).toBe(false)
                expect(scheduled).not.toBeNull()

                // Once it does run, the next reader is served something current
                // instead of the same stale entry.
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

                // Retained for zero seconds: past `staleUntil` the moment it
                // lands. A second instance reads it, so L1 cannot be the reason
                // it is not served.
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

                // The reader keeps the stale value — a refresh that could not
                // answer is not an answer that replaces one...
                expect(served).toEqual({ name: "stale" })

                // ...but what it wrote is the absence, on the short window, so the
                // next reader does not treat it as a fact for five minutes.
                const envelope = envelopeOf(store, key)

                expect(envelope.value).toBeNull()
                expect(envelope.freshUntil - Date.now()).toBeLessThanOrEqual(
                    emptyTtl.freshSeconds * 1000,
                )
            }),
    )
})

/**
 * What a `null` is allowed to mean once it is stored.
 *
 * `null` is this codebase's "the upstream could not answer" sentinel — v1
 * answering 404 and v1 being unreachable collapse into it deliberately — so the
 * cache must not keep it with the confidence of a value. These cases pin the
 * two directions of that: an absence is short-lived, and a real value is not.
 */
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
                /*
                 * Stored on `cacheTtl.profile` — as it was — the absence would
                 * have stayed fresh for five minutes and been retained for an
                 * hour, which is how a player the app had merely failed to read
                 * ended up reported as not existing long after upstream would
                 * have answered.
                 */
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

            // The fix is about `null` only. Shortening every entry would throw
            // away the profile window the rest of the app is tuned around.
            expect(
                envelopeOf(store, key).freshUntil - Date.now(),
            ).toBeGreaterThan(emptyTtl.freshSeconds * 1000)
        }),
    )
})
