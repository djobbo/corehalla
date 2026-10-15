import { describe, expect, it } from "@effect/vitest"
import { Effect, Schema } from "effect"
import { make } from "./cache"
import { cacheTtl } from "./cache-policy"
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

/** Current shape of a cached row. */
const RowSchema = Schema.Struct({
    name: Schema.String,
    xp: Schema.Number,
})

type Row = typeof RowSchema.Type

const row = (name: string, xp: number): Row => ({ name, xp })

const envelopeValue = (store: Map<string, string>, key: string) =>
    (
        JSON.parse(store.get(key) as string) as {
            value: unknown
        }
    ).value

describe("schema validation on read", () => {
    it.effect(
        "a cached value that no longer matches the schema is refetched and replaced",
        () =>
            Effect.gen(function* () {
                const { store, kv } = fakeKv()
                const writer = make(async () => kv, inlineSchedule)
                const key = "schema:stale"

                // Written before a shape change: no `xp`.
                yield* writer.set(key, { name: "old" }, cacheTtl.profile)

                // Cold L1 so the read hits KV, like a fresh isolate.
                const reader = make(async () => kv, inlineSchedule)

                let fetched = false

                const served = yield* reader.getOrSet(
                    key,
                    { ...cacheTtl.profile, schema: RowSchema },
                    Effect.sync(() => {
                        fetched = true

                        return row("new", 2)
                    }),
                )

                expect(served).toEqual({ name: "new", xp: 2 })
                expect(fetched).toBe(true)
                expect(envelopeValue(store, key)).toEqual({
                    name: "new",
                    xp: 2,
                })
            }),
    )

    it.effect("a matching value is served without a fetch", () =>
        Effect.gen(function* () {
            const { kv } = fakeKv()
            const writer = make(async () => kv, inlineSchedule)
            const key = "schema:valid"

            yield* writer.set(key, row("current", 1), cacheTtl.profile)

            const reader = make(async () => kv, inlineSchedule)

            let fetched = false

            const served = yield* reader.getOrSet(
                key,
                { ...cacheTtl.profile, schema: RowSchema },
                Effect.sync(() => {
                    fetched = true

                    return row("refetched", 9)
                }),
            )

            expect(served).toEqual({ name: "current", xp: 1 })
            expect(fetched).toBe(false)
        }),
    )

    it.effect("an L1 entry that no longer matches is dropped too", () =>
        Effect.gen(function* () {
            const { kv } = fakeKv()
            const cache = make(async () => kv, inlineSchedule)
            const key = "schema:l1"

            yield* cache.set(key, { name: "old" }, cacheTtl.profile)

            let fetched = false

            const served = yield* cache.getOrSet(
                key,
                { ...cacheTtl.profile, schema: RowSchema },
                Effect.sync(() => {
                    fetched = true

                    return row("new", 3)
                }),
            )

            expect(served).toEqual({ name: "new", xp: 3 })
            expect(fetched).toBe(true)
        }),
    )

    it.effect("without a schema the cached value is served as-is", () =>
        Effect.gen(function* () {
            const { kv } = fakeKv()
            const writer = make(async () => kv, inlineSchedule)
            const key = "schema:none"

            yield* writer.set(key, { name: "old" }, cacheTtl.profile)

            const reader = make(async () => kv, inlineSchedule)

            let fetched = false

            const served = yield* reader.getOrSet(
                key,
                cacheTtl.profile,
                Effect.sync(() => {
                    fetched = true

                    return { name: "new" }
                }),
            )

            expect(served).toEqual({ name: "old" })
            expect(fetched).toBe(false)
        }),
    )
})
