import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"
import { Background, layer, pendingWork } from "./background"

/**
 * The properties the request path depends on.
 *
 * Work handed to `Background` must not delay the caller — that is why it is not
 * awaited — but it must still be *reachable* by the platform afterwards, because
 * on Workers a fiber the runtime cannot see is cancelled when the response
 * returns. `Effect.forkDetach` gave the first and not the second, which is the
 * bug: writes that vanished with no error and no log.
 *
 * The same argument applies one level down. Background work that hands more
 * work to `Background` must run that child inline, because the parent's
 * `waitUntil` promise is the only thing the platform is holding — a detached
 * grandchild would settle after it and be cancelled.
 */

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

            // The whole point: the caller — a request handler about to write its
            // response — is not waiting on the database.
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

            /*
             * What the worker entry hands to `ctx.waitUntil`. Without this
             * promise the runtime has no reason to keep the isolate alive, and
             * the write above is cancelled rather than merely delayed.
             */
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
                        // A boundary, so the outer effect is still pending below.
                        yield* Effect.sleep("20 millis")

                        /*
                         * A cache refresh writes the archive, and that write is
                         * handed to `Background` in turn. Detaching this child
                         * would put it outside the one `waitUntil` promise the
                         * platform holds — the parent's — so it has to run on the
                         * parent's fiber instead.
                         */
                        yield* background.run(
                            Effect.sync(() => {
                                inner = true
                            }),
                        )

                        expect(inner).toBe(true)
                    }),
                )

                // The outer work is detached like any other...
                expect(inner).toBe(false)

                // ...and the child lands with it, before the entry's promise does.
                yield* Effect.promise(() => pendingWork())
                expect(inner).toBe(true)
            }).pipe(Effect.provide(layer)),
    )

    it.effect("fails the work, not the caller, when a write is broken", () =>
        Effect.gen(function* () {
            const background = yield* Background

            // A defect in the background write must not surface as a failed
            // request that has already been answered.
            yield* background.run(Effect.die(new Error("database down")))

            yield* Effect.promise(() => pendingWork())
        }).pipe(Effect.provide(layer)),
    )
})
