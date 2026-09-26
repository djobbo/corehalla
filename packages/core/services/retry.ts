import { Effect, Schedule } from "effect"
import { HttpClientError } from "effect/unstable/http"

/**
 * Retry policy for outbound calls to Brawlhalla.
 *
 * This is the *outbound* direction (API worker → Brawlhalla). The Start app has
 * its own policy for the *inbound* direction (browser → API worker) in
 * `apps/web/src/effect/retry.ts`; they are deliberately separate so either can
 * be tuned without changing the other's failure semantics.
 *
 * Transport failures (network errors, timeouts, aborted requests) are retried
 * with exponential backoff: 200ms, 400ms, 800ms, 1.6s.
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
