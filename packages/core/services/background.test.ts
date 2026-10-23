import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"
import { Background, layer, pendingWork } from "./background"

describe("Background", () => {
    it.effect("returns before the work finishes", () =>
        Effect.gen(function* () {
            const background = yield* Background
            let finished = false

            yield* background.run(
                Effect.sleep("20 millis").pipe(
                    Effect.andThen(
                        Effect.sync(() => {
                            finished = true
                        }),
                    ),
                ),
            )

            expect(finished).toBe(false)

            // Let it land so the test does not leave work behind.
            yield* Effect.promise(() => pendingWork())
            expect(finished).toBe(true)
        }).pipe(Effect.provide(layer)),
    )

    it.effect("exposes the work through the promise the entry waits on", () =>
        Effect.gen(function* () {
            const background = yield* Background
            let finished = false

            yield* background.run(
                Effect.sleep("20 millis").pipe(
                    Effect.andThen(
                        Effect.sync(() => {
                            finished = true
                        }),
                    ),
                ),
            )

            yield* Effect.promise(() => pendingWork())

            expect(finished).toBe(true)
        }).pipe(Effect.provide(layer)),
    )

    it.effect(
        "runs nested work inline, inside the parent the platform holds",
        () =>
            Effect.gen(function* () {
                const background = yield* Background
                let inner = false

                yield* background.run(
                    Effect.gen(function* () {
                        yield* Effect.sleep("20 millis")

                        yield* background.run(
                            Effect.sync(() => {
                                inner = true
                            }),
                        )

                        expect(inner).toBe(true)
                    }),
                )

                expect(inner).toBe(false)

                // ...and the child lands with it, before the entry's promise does.
                yield* Effect.promise(() => pendingWork())
                expect(inner).toBe(true)
            }).pipe(Effect.provide(layer)),
    )

    it.effect("fails the work, not the caller, when a write is broken", () =>
        Effect.gen(function* () {
            const background = yield* Background

            yield* background.run(Effect.die(new Error("database down")))

            yield* Effect.promise(() => pendingWork())
        }).pipe(Effect.provide(layer)),
    )
})
