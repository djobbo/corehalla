import { describe, expect, it } from "@effect/vitest"
import { Duration, Effect, Exit, Schedule } from "effect"
import {
    HttpClientRequest,
    HttpClientResponse,
    type HttpClientError,
} from "effect/unstable/http"
import {
    defaultRetryOptions,
    rateLimitWaitMs,
    retryAfterMs,
    retrySchedule,
    retryTransient,
    retryTransientWith,
    type RetryOptions,
} from "./retry"

/**
 * The outbound retry policy.
 *
 * The two failure classes are asserted separately, because distinguishing them
 * is the whole point of the module: a transient failure is retried on an
 * exponential backoff, while a `429` is answered with a wait at least as long as
 * the server's own instruction. The bug this guards against is a rate limit
 * being retried at the transient backoff — "slow down" answered with "no".
 *
 * The errors are built the way production builds them, through
 * `HttpClientResponse.filterStatusOk`, rather than by calling an error
 * constructor. That matters: `HttpClientError` is a *wrapper* whose `reason`
 * holds the status, and an error constructed by hand does not have the shape
 * `isHttpClientError` looks for, so a hand-built error would make these tests
 * assert against a failure the client can never actually produce.
 */

const REQUEST = HttpClientRequest.get("https://api.brawlhalla.com/v1/x")

/** An `HttpClientError` exactly as `filterStatusOk` produces one. */
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

/**
 * A transport failure, shaped the way the HTTP client wraps one.
 *
 * The `~effect/http/HttpClientError` key is the wrapper's runtime type id;
 * `isHttpClientError` tests for its presence.
 */
const transportError = () =>
    ({
        _tag: "HttpClientError",
        "~effect/http/HttpClientError": "~effect/http/HttpClientError",
        reason: { _tag: "TransportError", description: "socket closed" },
    }) as unknown as HttpClientError.HttpClientError

/**
 * An effect that always fails with the given error, counting its evaluations.
 *
 * The counter is the only way to observe that a retry happened without waiting
 * the backoff out: each evaluation is free.
 */
const countingFailure = (error: HttpClientError.HttpClientError) => {
    let attempts = 0

    const effect = Effect.suspend(() => {
        attempts++
        return Effect.fail(error)
    })

    return { effect, attempts: () => attempts }
}

/** The wait the real schedule chooses for one failure, in milliseconds. */
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
        // 2s, not the 500ms the exponential step would have used: the response
        // refused this request for a window, and 500ms is inside it.
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
        // A shorter wait than the server asked for is how the same limit gets
        // hit twice, so the response wins even at this size.
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
    /**
     * The retry count is asserted against the same wiring with a tiny backoff.
     *
     * Waiting the production delays out would make this file take half a minute
     * — a `429` retried four times at the real floor is a 30-second sleep — and
     * a slow test is a test that eventually gets deleted. The production delays
     * themselves are asserted in `retrySchedule` above, against the real
     * defaults.
     */
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
        // One initial attempt plus the four permitted retries.
        expect(attempts()).toBe(5)
    })

    it("retries a 5xx and does not succeed", async () => {
        const { effect, attempts } = countingFailure(await statusError(503))

        await Effect.runPromise(Effect.exit(retryTransientWith(effect, fast)))

        expect(attempts()).toBe(5)
    })

    it("retries a transport failure", async () => {
        const { effect, attempts } = countingFailure(transportError())

        await Effect.runPromise(Effect.exit(retryTransientWith(effect, fast)))

        expect(attempts()).toBe(5)
    })

    it("does not retry a status that repetition cannot fix", async () => {
        // A 403 is the shape Brawlhalla returns for a rejected key, and it is
        // the same answer every time. Retrying it four times only makes the
        // failure slower.
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
