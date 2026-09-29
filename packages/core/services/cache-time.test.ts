import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"
import { make } from "./cache"
import type { KVNamespaceLike } from "../env"

/**
 * The age a cached read reports.
 *
 * `getOrSetCached` exists so an aggregate can report the age of its *oldest*
 * part instead of the moment it was assembled. That only means anything if the
 * timestamp is the entry's own fetch time and survives the trip through KV —
 * a value recomputed on read would always be "now", and one that is not
 * persisted would read differently in every isolate.
 *
 * The background scheduler runs inline here, so the ordering is deterministic:
 * a stale read returns the stale timestamp and whatever the refresh wrote has
 * landed by the time the next assertion runs.
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

const inlineSchedule = (effect: Effect.Effect<unknown, unknown>) =>
    effect.pipe(Effect.orDie, Effect.asVoid)

const fresh = { freshSeconds: 300, staleSeconds: 3_600 } as const

describe("getOrSetCached", () => {
    it.effect("reports the fetch time, and repeats it on a cache hit", () =>
        Effect.gen(function* () {
            const { kv } = fakeKv()
            const cache = make(async () => kv, inlineSchedule)

            const first = yield* cache.getOrSetCached(
                "k",
                fresh,
                Effect.succeed("v"),
            )
            const second = yield* cache.getOrSetCached(
                "k",
                fresh,
                Effect.succeed("v"),
            )

            expect(second.value).toBe("v")
            expect(second.updatedAt).toBe(first.updatedAt)
        }),
    )

    it.effect("survives KV, so another isolate reports the same age", () =>
        Effect.gen(function* () {
            const { kv } = fakeKv()

            // Two instances, so the second has a genuinely cold L1 and any hit
            // it takes must have come from KV.
            const writer = make(async () => kv, inlineSchedule)
            const reader = make(async () => kv, inlineSchedule)

            const first = yield* writer.getOrSetCached(
                "k",
                fresh,
                Effect.succeed("v"),
            )
            const fromKv = yield* reader.getOrSetCached(
                "k",
                fresh,
                Effect.succeed("v"),
            )

            expect(fromKv.value).toBe("v")
            expect(fromKv.updatedAt).toBe(first.updatedAt)

            // The KV hit was promoted into the reader's L1, so a repeat read
            // still reports the original age rather than a fresh one.
            const again = yield* reader.getOrSetCached(
                "k",
                fresh,
                Effect.succeed("v"),
            )
            expect(again.updatedAt).toBe(first.updatedAt)
        }),
    )

    it.effect("reports the stale fetch while a refresh runs behind it", () =>
        Effect.gen(function* () {
            const { kv } = fakeKv()
            const cache = make(async () => kv, inlineSchedule)

            // Zero freshness, so the entry is stale the moment it is written —
            // the "answered from a stale entry" case without a fake clock.
            const short = { freshSeconds: 0, staleSeconds: 3_600 } as const

            const first = yield* cache.getOrSetCached(
                "k",
                short,
                Effect.succeed("stale"),
            )
            const second = yield* cache.getOrSetCached(
                "k",
                short,
                Effect.succeed("refreshed"),
            )

            expect(second.value).toBe("stale")
            expect(second.updatedAt).toBe(first.updatedAt)
        }),
    )

    it.effect("reconstructs the age of an envelope written without one", () =>
        Effect.gen(function* () {
            const { store, kv } = fakeKv()
            const freshUntil = Date.now() + 60_000

            // The shape an older deployment left behind: freshness recorded,
            // write time not.
            store.set(
                "k",
                JSON.stringify({
                    value: "v",
                    freshUntil,
                    staleUntil: freshUntil + 3_600_000,
                }),
            )

            const cache = make(async () => kv, inlineSchedule)
            const read = yield* cache.getOrSetCached(
                "k",
                { freshSeconds: 120, staleSeconds: 3_600 },
                Effect.succeed("ignored"),
            )

            expect(read.value).toBe("v")
            expect(read.updatedAt).toBe(freshUntil - 120_000)
        }),
    )
})
