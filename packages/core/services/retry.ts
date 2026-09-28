import { Duration, Effect, Predicate, Schedule } from "effect"
import { HttpClientError } from "effect/unstable/http"

/**
 * Retry policy for outbound calls to Brawlhalla.
 *
 * This is the *outbound* direction (API worker → Brawlhalla). The Start app has
 * its own policy for the *inbound* direction (browser → API worker) in
 * `apps/web/src/effect/retry.ts`; they are deliberately separate so either can
 * be tuned without changing the other's failure semantics.
 *
 * Two failure classes are retried, and they are not the same thing:
 *
 * - **Transient** — transport failures, timeouts and 5xx — get exponential
 *   backoff. The assumption is that the next attempt could succeed.
 * - **Rate-limited (429)** gets `Retry-After` when Brawlhalla sends it and a
 *   floor of {@link MIN_RATE_LIMIT_WAIT_MS} otherwise. The assumption is that the
 *   next attempt *will* succeed, but only after the window that refused this one
 *   has passed. Retrying a 429 at the transient backoff is the behavior that
 *   escalates a soft limit into a block: it answers "slow down" with "no".
 *
 * Everything else — 403, 404, a decode failure — is returned to the caller on
 * the first attempt. Those do not improve with repetition.
 */

/** Total attempts, including the first. Four retries follow it. */
const MAX_ATTEMPTS = 5

/**
 * The backoff for everything *except* a rate-limit answer.
 *
 * Transport failures (network errors, timeouts, aborted requests) are retried at
 * 500ms, 1s, 2s, 4s. A little slower than the 200ms this once used, because the
 * caller paces itself at 225ms and a retry is meant to be a gap in the traffic,
 * not more of it.
 */
const TRANSIENT_BASE_MS = 500

/**
 * The shortest wait after a `429`, when the response names no usable delay.
 *
 * A rate limit is a statement about a window, not a blip: the exponential
 * schedule alone would answer the first one after 500ms, which is not long
 * enough to be out of the window that produced it.
 */
const MIN_RATE_LIMIT_WAIT_MS = 2_000

/**
 * A `429` failure, narrowed to the two fields the retry policy reads.
 *
 * The parameter is spelled out because Effect's own `StatusCodeError` is not
 * assignable to the `HttpClientError` union for a *predicate* return type — the
 * union member is the wrapped reason, not the error — so narrowing to it is
 * rejected at compile time. Naming only what is used also means this type does
 * not chase the library's error shape.
 */
type RateLimited = {
    readonly reason: {
        readonly response: {
            readonly status: number
            readonly headers: { readonly [key: string]: string }
        }
    }
}

/**
 * Whether a failure is a `429`.
 *
 * This deliberately reads the response status rather than the reason's `_tag`.
 * The tag alone is not enough: it identifies the reason, not the status.
 */
const isRateLimited = (
    error: HttpClientError.HttpClientError,
): error is HttpClientError.HttpClientError & RateLimited =>
    HttpClientError.isHttpClientError(error) &&
    Predicate.isTagged(error.reason, "StatusCodeError") &&
    error.reason.response.status === 429

/** The transport, timeout and 5xx failures that a retry can plausibly fix. */
const isTransportFailure = (error: HttpClientError.HttpClientError): boolean =>
    HttpClientError.isHttpClientError(error) &&
    Predicate.isTagged(error.reason, "TransportError")

/** The `5xx` responses that a retry can plausibly fix. */
const isServerFailure = (error: HttpClientError.HttpClientError): boolean =>
    HttpClientError.isHttpClientError(error) &&
    Predicate.isTagged(error.reason, "StatusCodeError") &&
    error.reason.response.status >= 500

/**
 * Whether a retry could plausibly succeed.
 *
 * A reason with any other tag carries no HTTP status to judge — a decode
 * failure will decode the same way twice — so it is not retried.
 */
const isTransientFailure = (error: HttpClientError.HttpClientError): boolean =>
    isTransportFailure(error) || isServerFailure(error)

/**
 * How long to wait after a `429`.
 *
 * `Retry-After` is the server's own instruction about *its* budget, so it wins
 * when present — the crawl is the guest here. Both documented forms are accepted
 * (delta-seconds and an HTTP-date); anything unparseable, absent or already
 * elapsed falls back to the schedule's backoff.
 *
 * There is deliberately no ceiling. Clamping a server's own instruction would
 * hand us a shorter wait than the one it asked for, which is how a rate limit
 * gets hit twice; and Brawlhalla is not a source of hostile `Retry-After`
 * values. A response this code did not expect is a much rarer problem than
 * ignoring the one it did.
 */
export const retryAfterMs = (
    header: string | undefined,
    now: number = Date.now(),
): number | undefined => {
    if (!header) return undefined

    const seconds = Number(header.trim())
    const parsed = Number.isFinite(seconds)
        ? seconds * 1_000
        : Date.parse(header) - now

    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}

/**
 * How long a `429` needs before the next attempt, in milliseconds — `0` for
 * every other failure.
 *
 * Takes `unknown` because the value arrives as a schedule step's input, which
 * the `Schedule` combinators cannot type more precisely than that. Narrowing
 * happens here, where it can be asserted in one place.
 */
export const rateLimitWaitMs = (
    error: unknown,
    floorMs: number = MIN_RATE_LIMIT_WAIT_MS,
): number => {
    if (!isRateLimited(error as HttpClientError.HttpClientError)) return 0

    const limited = error as HttpClientError.HttpClientError & RateLimited

    return Math.max(
        retryAfterMs(limited.reason.response.headers["retry-after"]) ?? 0,
        floorMs,
    )
}

/**
 * The policy's tunable sizes.
 *
 * Exists so the tests can exercise the retry *count* and the scheduling wiring
 * without sleeping through the production backoff — a `429` retried four times
 * at the real floor takes half a minute. Production never passes this; the
 * defaults below are the shipped behaviour, and the schedule assertions in the
 * tests still run against them.
 */
export type RetryOptions = {
    readonly transientBaseMs: number
    readonly rateLimitFloorMs: number
}

export const defaultRetryOptions: RetryOptions = {
    transientBaseMs: TRANSIENT_BASE_MS,
    rateLimitFloorMs: MIN_RATE_LIMIT_WAIT_MS,
}

/**
 * The backoff, with a `429`'s own wait folded in.
 *
 * The base is exponential — 500ms, 1s, 2s, 4s by default — and `passthrough`
 * keeps the failure itself as the step's input, so the delay function below can
 * read the status and headers of the answer that caused it. A plain schedule
 * would hand it the elapsed duration instead.
 *
 * `modifyDelay` *replaces* the step's delay rather than adding to it, so every
 * branch returns an explicit duration. A `429` takes the longer of the
 * exponential step and the server's own instruction — `Retry-After`, or the
 * floor when it sent none — which is what stops a rate limit from being
 * answered after a 500ms backoff, well inside the window that produced it.
 * Every other failure keeps the exponential step untouched.
 */
export const retryScheduleWith = (options: RetryOptions) =>
    Schedule.passthrough(Schedule.exponential(options.transientBaseMs)).pipe(
        Schedule.modifyDelay((metadata) => {
            const wait = Math.max(
                Duration.toMillis(metadata.duration),
                rateLimitWaitMs(metadata.input, options.rateLimitFloorMs),
            )

            return Effect.succeed(Duration.millis(wait))
        }),
    )

/** The shipped schedule. The tests assert its steps against these defaults. */
export const retrySchedule = retryScheduleWith(defaultRetryOptions)

export const retryTransientWith = <
    A,
    E extends HttpClientError.HttpClientError,
    R,
>(
    request: Effect.Effect<A, E, R>,
    options: RetryOptions,
): Effect.Effect<A, E, R> =>
    request.pipe(
        Effect.retry({
            schedule: retryScheduleWith(options),
            times: MAX_ATTEMPTS - 1,
            /*
             * The loop stops on the first failure that is neither transient nor a
             * rate limit, so a 403 or 404 is returned to the caller immediately
             * rather than being retried into a slower, identical failure.
             */
            while: (
                error: HttpClientError.HttpClientError,
            ): boolean | Effect.Effect<boolean> =>
                isRateLimited(error) || isTransientFailure(error),
        }),
    )

export const retryTransient = <A, E extends HttpClientError.HttpClientError, R>(
    request: Effect.Effect<A, E, R>,
): Effect.Effect<A, E, R> => retryTransientWith(request, defaultRetryOptions)
