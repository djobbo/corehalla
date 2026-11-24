import { Effect } from "effect"
import { Atom } from "effect/reactivity"
import * as AsyncResult from "effect/reactivity/AsyncResult"
import * as Schema from "effect/Schema"
import { describe, expect, it } from "vite-plus/test"
import { makeRegistry, preloadAtomsDegraded } from "./atoms"

const numberAtom = (key: string, effect: Effect.Effect<number, string>) =>
    Atom.keepAlive(
        Atom.serializable(Atom.make(effect), {
            key,
            schema: AsyncResult.Schema({ success: Schema.Finite }),
        }),
    )

const keysOf = (
    dehydrated: Awaited<ReturnType<typeof preloadAtomsDegraded>>["dehydrated"],
): ReadonlyArray<string> =>
    dehydrated.map((entry) => ("key" in entry ? String(entry.key) : ""))

describe("preloadAtomsDegraded", () => {
    it("dehydrates a decoration that settles after the required group", async () => {
        const registry = makeRegistry()

        const result = await preloadAtomsDegraded(
            { registry },
            [numberAtom("test:required", Effect.succeed(1))],
            [
                numberAtom(
                    "test:decoration",
                    Effect.gen(function* () {
                        yield* Effect.sleep("30 millis")
                        return 2
                    }),
                ),
            ],
        )

        expect(result.degraded).toBe(false)
        expect(keysOf(result.dehydrated)).toEqual(
            expect.arrayContaining(["test:required", "test:decoration"]),
        )
    })

    it("does not degrade the route when a decoration fails", async () => {
        const registry = makeRegistry()

        const result = await preloadAtomsDegraded(
            { registry },
            [numberAtom("test:required", Effect.succeed(1))],
            [numberAtom("test:decoration", Effect.fail("nope"))],
        )

        expect(result.degraded).toBe(false)
        expect(keysOf(result.dehydrated)).toContain("test:required")
    })

    it("degrades and hands over nothing when a required atom fails", async () => {
        const registry = makeRegistry()

        const result = await preloadAtomsDegraded(
            { registry },
            [numberAtom("test:broken", Effect.fail("nope"))],
            [numberAtom("test:decoration", Effect.succeed(2))],
        )

        expect(result.degraded).toBe(true)
        expect(result.dehydrated).toEqual([])
    })
})
