import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"
import { make } from "./cache"
import type { KVNamespaceLike } from "../env"

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
