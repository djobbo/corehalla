import { Effect, Schedule } from "effect"
import { HttpClient, HttpClientError } from "effect/unstable/http"

/**
 * Shared retry policy for outbound HTTP calls.
 *
 * Transport failures (network errors, timeouts, aborted requests) are retried
 * with exponential backoff: 200ms, 400ms, 800ms, 1.6s. This replaces the
 * ad-hoc retry policy that lived in the React Query client options.
 */
export const retryTransient = <A, E extends HttpClientError.HttpClientError, R>(
    request: Effect.Effect<A, E, R>,
): Effect.Effect<A, E, R> =>
    request.pipe(
        Effect.retry({
            schedule: Schedule.exponential("200 millis"),
            times: 4,
            while: HttpClientError.isHttpClientError,
        }),
    )

/** Applies the shared retry policy to every request made by a client. */
export const withRetry = (client: HttpClient.HttpClient) =>
    HttpClient.transform(client, (effect) => retryTransient(effect))
