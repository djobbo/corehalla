import { Effect, Schedule } from "effect"
import { HttpClient, HttpClientError } from "effect/unstable/http"

/**
 * Retry policy for requests this app makes to the Corehalla API.
 *
 * This is the *inbound* direction (browser → API worker). The API worker has its
 * own policy for the *outbound* direction (API worker → Brawlhalla) in
 * `apps/api/src/services/retry.ts`; the two are deliberately separate so either
 * can be tuned without changing the other's failure semantics.
 *
 * Transport failures (network errors, timeouts, aborted requests) are retried
 * with exponential backoff: 200ms, 400ms, 800ms, 1.6s.
 */
export const withRetry = (client: HttpClient.HttpClient) =>
    HttpClient.transform(client, (effect) =>
        effect.pipe(
            Effect.retry({
                schedule: Schedule.exponential("200 millis"),
                times: 4,
                while: HttpClientError.isHttpClientError,
            }),
        ),
    )
