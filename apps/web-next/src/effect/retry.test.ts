import { Duration, Effect, Exit, Fiber, Schedule } from "effect"
import { HttpClient, HttpClientError } from "effect/http"
import { TestClock } from "effect/testing"
import { describe, expect, it } from "vite-plus/test"
import { retrySchedule, withRetry } from "./retry"

const delays = Effect.gen(function* () {
    const step = yield* Schedule.toStep(retrySchedule)
    const waits: Array<number> = []
    let now = 0

    for (let i = 0; i < 8; i++) {
        const exit = yield* Effect.exit(step(now, undefined))
        if (Exit.isFailure(exit)) return waits

        const millis = Duration.toMillis(exit.value[1])
        waits.push(millis)
        now += millis
    }

    return waits
})

describe("retrySchedule", () => {
    it("backs off twice: 200ms then 400ms", async () => {
        expect(await Effect.runPromise(delays)).toEqual([200, 400])
    })
})

describe("withRetry", () => {
    it("retries a transport error twice", async () => {
        let attempts = 0

        const client = withRetry(
            HttpClient.make((request) => {
                attempts++
                return Effect.fail(
                    new HttpClientError.HttpClientError({
                        reason: new HttpClientError.TransportError({
                            request,
                            cause: "socket closed",
                        }),
                    }),
                )
            }),
        )

        await Effect.runPromise(
            Effect.gen(function* () {
                const fiber = yield* client
                    .get("http://api.internal/api/v1/x")
                    .pipe(Effect.forkChild)
                yield* TestClock.adjust("600 millis")
                yield* Fiber.join(fiber).pipe(Effect.ignore)
            }).pipe(Effect.provide(TestClock.layer())),
        )

        expect(attempts).toBe(3)
    })
})
