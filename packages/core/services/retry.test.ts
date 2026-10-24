import { describe, expect, it } from "@effect/vitest"
import { Duration, Effect, Exit, Schedule } from "effect"
import {
    HttpClientRequest,
    HttpClientResponse,
    type HttpClientError,
} from "effect/http"
import {
    defaultRetryOptions,
    rateLimitWaitMs,
    retryAfterMs,
    retrySchedule,
    retryTransient,
    retryTransientWith,
    type RetryOptions,
} from "./retry"

const REQUEST = HttpClientRequest.get("https://api.brawlhalla.com/v1/x")

const statusError = (
    status: number,
    headers: Record<string, string> = {},
): Promise<HttpClientError.HttpClientError> =>
    Effect.runPromise(
        HttpClientResponse.filterStatusOk(
            HttpClientResponse.fromWeb(
                REQUEST,
                new Response("{}", {
                    status,
                    headers: { "content-type": "application/json", ...headers },
                }),
            ),
        ).pipe(Effect.flip),
    )

const transportError = () =>
    ({
        _tag: "HttpClientError",
        "~effect/http/HttpClientError": "~effect/http/HttpClientError",
        reason: { _tag: "TransportError", description: "socket closed" },
    }) as unknown as HttpClientError.HttpClientError

const countingFailure = (error: HttpClientError.HttpClientError) => {
    let attempts = 0

    const effect = Effect.suspend(() => {
        attempts++
        return Effect.fail(error)
    })

    return { effect, attempts: () => attempts }
}

const waitFor = (error: HttpClientError.HttpClientError) =>
    Effect.runPromise(
        Effect.gen(function* () {
            const step = yield* Schedule.toStep(retrySchedule)
            const [_, delay] = yield* step(0, error)

            return Duration.toMillis(delay)
        }),
    )

describe("rateLimitWaitMs", () => {
    it("uses the server's Retry-After when it sends one", async () => {
        expect(
            rateLimitWaitMs(await statusError(429, { "retry-after": "30" })),
        ).toBe(30_000)
    })

    it("falls back to a floor when Retry-After is absent", async () => {
        expect(rateLimitWaitMs(await statusError(429))).toBe(2_000)
    })

    it("ignores a Retry-After shorter than the floor", async () => {
        expect(
            rateLimitWaitMs(await statusError(429, { "retry-after": "1" })),
        ).toBe(2_000)
    })

    it("is zero for every other failure", async () => {
        expect(rateLimitWaitMs(await statusError(503))).toBe(0)
        expect(rateLimitWaitMs(await statusError(403))).toBe(0)
        expect(rateLimitWaitMs(transportError())).toBe(0)
    })
})

describe("retryAfterMs", () => {
    it("parses delta-seconds", () => {
        expect(retryAfterMs("120")).toBe(120_000)
        expect(retryAfterMs(" 5 ")).toBe(5_000)
    })

    it("parses an HTTP-date", () => {
        const now = Date.parse("2026-01-01T00:00:00Z")

        expect(retryAfterMs("Thu, 01 Jan 2026 00:00:30 GMT", now)).toBe(30_000)
    })

    it("rejects absent, malformed and elapsed values", () => {
        expect(retryAfterMs(undefined)).toBeUndefined()
        expect(retryAfterMs("")).toBeUndefined()
        expect(retryAfterMs("soon")).toBeUndefined()
        expect(retryAfterMs("0")).toBeUndefined()
        expect(retryAfterMs("-5")).toBeUndefined()
    })

    it("honours a long instruction rather than clamping it", () => {
        expect(retryAfterMs("600")).toBe(600_000)
    })
})

describe("retrySchedule", () => {
    it("waits the rate-limit floor after a 429", async () => {
        expect(await waitFor(await statusError(429))).toBeGreaterThanOrEqual(
            2_000,
        )
    })

    it("waits as long as the server instructed after a 429", async () => {
        expect(
            await waitFor(await statusError(429, { "retry-after": "30" })),
        ).toBeGreaterThanOrEqual(30_000)
    })

    it("keeps the exponential backoff for a transient failure", async () => {
        expect(await waitFor(await statusError(503))).toBe(500)
    })
})

describe("retryTransient", () => {
    const fast: RetryOptions = {
        transientBaseMs: 1,
        rateLimitFloorMs: 1,
    }

    it("agrees with the shipped defaults on its own sizes", () => {
        expect(defaultRetryOptions.transientBaseMs).toBe(500)
        expect(defaultRetryOptions.rateLimitFloorMs).toBe(2_000)
    })

    it("retries a 429 and does not succeed", async () => {
        const { effect, attempts } = countingFailure(await statusError(429))

        const exit = await Effect.runPromise(
            Effect.exit(retryTransientWith(effect, fast)),
        )

        expect(Exit.isFailure(exit)).toBe(true)
        // One initial attempt plus the two permitted retries.
        expect(attempts()).toBe(3)
    })

    it("retries a 5xx and does not succeed", async () => {
        const { effect, attempts } = countingFailure(await statusError(503))

        await Effect.runPromise(Effect.exit(retryTransientWith(effect, fast)))

        expect(attempts()).toBe(3)
    })

    it("retries a transport failure", async () => {
        const { effect, attempts } = countingFailure(transportError())

        await Effect.runPromise(Effect.exit(retryTransientWith(effect, fast)))

        expect(attempts()).toBe(3)
    })

    it("does not retry a status that repetition cannot fix", async () => {
        const { effect, attempts } = countingFailure(await statusError(403))

        const exit = await Effect.runPromise(
            Effect.exit(retryTransientWith(effect, fast)),
        )

        expect(Exit.isFailure(exit)).toBe(true)
        expect(attempts()).toBe(1)
    })

    it("does not retry a 404", async () => {
        const { effect, attempts } = countingFailure(await statusError(404))

        await Effect.runPromise(Effect.exit(retryTransientWith(effect, fast)))

        expect(attempts()).toBe(1)
    })

    it("succeeds without retrying once the request works", async () => {
        let attempts = 0

        const flaky = Effect.suspend(() => {
            attempts++
            return Effect.succeed("ok")
        })

        expect(await Effect.runPromise(retryTransient(flaky))).toBe("ok")
        expect(attempts).toBe(1)
    })
})
