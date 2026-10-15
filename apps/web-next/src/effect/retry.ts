import { Duration, Effect, Predicate, Schedule } from "effect"
import { HttpClient, HttpClientError } from "effect/unstable/http"

const BASE_MS = 200
const RETRIES = 2

/**
 * Retry policy for requests this app makes to the Corehalla API.
 *
 * Two retries, 200ms/400ms apart. This is the *inbound* direction (browser → API
 * worker); the API worker has its own policy for the *outbound* direction (API
 * worker → Brawhalla). Keep the inbound budget small: every retry re-runs the
 * whole worker request, and that request already retries upstream, so extra
 * attempts multiply load rather than absorb it.
 */
export const retrySchedule = Schedule.exponential(
    Duration.millis(BASE_MS),
).pipe(Schedule.upTo({ times: RETRIES }))

/**
 * Only repetition that can help: a transport failure, or a 5xx (edge or cold
 * start). A 4xx is a definitive answer the worker already computed, so retrying
 * it is pure load.
 */
const isRetryable = (error: HttpClientError.HttpClientError): boolean =>
    HttpClientError.isHttpClientError(error) &&
    (Predicate.isTagged(error.reason, "TransportError") ||
        (Predicate.isTagged(error.reason, "StatusCodeError") &&
            error.reason.response.status >= 500))

export const withRetry = (client: HttpClient.HttpClient) =>
    HttpClient.transform(client, (effect) =>
        effect.pipe(
            Effect.retry({ schedule: retrySchedule, while: isRetryable }),
        ),
    )
