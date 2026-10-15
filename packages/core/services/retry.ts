import { Duration, Effect, Predicate, Schedule } from "effect"
import { HttpClientError } from "effect/unstable/http"

const MAX_ATTEMPTS = 3

/**
 * Transient backoff base (500ms → 1s). Two retries, not four: this policy
 * serves interactive requests, and the cache plus the crawler are the
 * resilience layer, not a long backoff inside a request.
 */
const TRANSIENT_BASE_MS = 500

/** Floor after a 429 with no usable Retry-After — longer than the first transient step. */
const MIN_RATE_LIMIT_WAIT_MS = 2_000

/**
 * Fields the policy reads. Effect's StatusCodeError is not assignable to the
 * HttpClientError union for a predicate return type (union member is the reason).
 */
type RateLimited = {
    readonly reason: {
        readonly response: {
            readonly status: number
            readonly headers: { readonly [key: string]: string }
        }
    }
}

/** Reads response status, not the reason `_tag` — the tag is not the status. */
const isRateLimited = (
    error: HttpClientError.HttpClientError,
): error is HttpClientError.HttpClientError & RateLimited =>
    HttpClientError.isHttpClientError(error) &&
    Predicate.isTagged(error.reason, "StatusCodeError") &&
    error.reason.response.status === 429

const isTransportFailure = (error: HttpClientError.HttpClientError): boolean =>
    HttpClientError.isHttpClientError(error) &&
    Predicate.isTagged(error.reason, "TransportError")

const isServerFailure = (error: HttpClientError.HttpClientError): boolean =>
    HttpClientError.isHttpClientError(error) &&
    Predicate.isTagged(error.reason, "StatusCodeError") &&
    error.reason.response.status >= 500

const isTransientFailure = (error: HttpClientError.HttpClientError): boolean =>
    isTransportFailure(error) || isServerFailure(error)

/** No ceiling — clamping Retry-After can re-hit the same window. */
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

/** 429 wait in ms; 0 for other failures. `unknown` — schedule step input is untyped. */
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

/** Tunable sizes for tests so they need not sleep through production backoff. */
export type RetryOptions = {
    readonly transientBaseMs: number
    readonly rateLimitFloorMs: number
}

export const defaultRetryOptions: RetryOptions = {
    transientBaseMs: TRANSIENT_BASE_MS,
    rateLimitFloorMs: MIN_RATE_LIMIT_WAIT_MS,
}

/**
 * Exponential + passthrough so delay can read the failure. modifyDelay replaces
 * the step; a 429 takes max(exponential, Retry-After | floor).
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
            // Stop immediately on 403/404/etc. — only transient and 429 retry.
            while: (
                error: HttpClientError.HttpClientError,
            ): boolean | Effect.Effect<boolean> =>
                isRateLimited(error) || isTransientFailure(error),
        }),
    )

export const retryTransient = <A, E extends HttpClientError.HttpClientError, R>(
    request: Effect.Effect<A, E, R>,
): Effect.Effect<A, E, R> => retryTransientWith(request, defaultRetryOptions)
