import { Duration, Effect, Predicate, Schedule } from "effect"
import { HttpClient, HttpClientError } from "effect/http"

const BASE_MS = 200
const RETRIES = 3

/**
 * Retry policy for requests this app makes to the Corehalla API.
 *
 * Three retries, 200ms/400ms/800ms apart, for transport failures and generic
 * 5xx. This is the *inbound* direction (browser → API worker); the API worker
 * has its own 3-retry policy for the *outbound* direction. A structured
 * section failure is not retried: the worker already exhausted upstream, so
 * the browser should fall back instead of re-running the whole request.
 */
export const retrySchedule = Schedule.exponential(
    Duration.millis(BASE_MS),
).pipe(Schedule.upTo({ times: RETRIES }))

/**
 * Only repetition that can help: a transport failure, or a 5xx (edge or cold
 * start). A 4xx is a definitive answer the worker already computed, so retrying
 * it is pure load. Section 502/503/504 responses carry
 * `x-corehalla-section-error`; retrying those would only re-run failed upstream
 * calls, so the client fallback takes over immediately.
 */
const isSectionError = (error: HttpClientError.HttpClientError): boolean =>
    Predicate.isTagged(error.reason, "StatusCodeError") &&
    error.reason.response.headers["x-corehalla-section-error"] === "1"

const isRetryable = (error: HttpClientError.HttpClientError): boolean =>
    HttpClientError.isHttpClientError(error) &&
    !isSectionError(error) &&
    (Predicate.isTagged(error.reason, "TransportError") ||
        (Predicate.isTagged(error.reason, "StatusCodeError") &&
            error.reason.response.status >= 500))

export const withRetry = (client: HttpClient.HttpClient) =>
    HttpClient.transform(client, (effect) =>
        effect.pipe(
            Effect.retry({ schedule: retrySchedule, while: isRetryable }),
        ),
    )
