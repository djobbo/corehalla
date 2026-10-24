import { describe, expect, it } from "@effect/vitest"
import { Effect, Fiber } from "effect"
import { TestClock } from "effect/testing"
import { HttpClient, HttpClientResponse } from "effect/http"
import { v1Ops } from "./v1"

const stats = {
    brawlhalla_id: 9219643,
    name: "Rooki",
    games: 37225,
    wins: 20625,
    xp: 4164569,
    level: 100,
    legends: [],
}

/** Serves `404 "Player not found"` for the first `failures` calls, then the record. */
const flakyClient = (failures: number) => {
    let calls = 0

    return {
        calls: () => calls,
        client: HttpClient.make((request) =>
            Effect.sync(() => {
                calls++
                const missing = calls <= failures

                return HttpClientResponse.fromWeb(
                    request,
                    new Response(
                        missing ? "Player not found" : JSON.stringify(stats),
                        {
                            status: missing ? 404 : 200,
                            headers: { "content-type": "application/json" },
                        },
                    ),
                )
            }),
        ),
    }
}

describe("v1 career-stats read", () => {
    it.effect("retries v1's transient 404 and returns the record", () =>
        Effect.gen(function* () {
            const { client, calls } = flakyClient(2)

            const fiber = yield* v1Ops(client)
                .getPlayerStats(9219643)
                .pipe(Effect.forkChild)

            yield* TestClock.adjust("4 seconds")

            const result = yield* Fiber.join(fiber)

            expect(result?.name).toBe("Rooki")
            expect(calls()).toBe(3)
        }),
    )

    it.effect("gives up after the retries and resolves to null", () =>
        Effect.gen(function* () {
            const { client, calls } = flakyClient(99)

            const fiber = yield* v1Ops(client)
                .getPlayerStats(9219643)
                .pipe(Effect.forkChild)

            yield* TestClock.adjust("10 seconds")

            expect(yield* Fiber.join(fiber)).toBeNull()
            // One initial attempt plus the three permitted retries.
            expect(calls()).toBe(4)
        }),
    )
})
