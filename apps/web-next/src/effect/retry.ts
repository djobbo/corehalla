import { Duration, Effect, Schedule } from "effect"
import { HttpClient, HttpClientError } from "effect/unstable/http"

const BASE_MS = 200
const EXPONENTIAL_RETRIES = 3
const PLATEAU_RETRIES = 3

/** Third exponential step (200 → 400 → 800), held for the remaining retries. */
const PLATEAU = Duration.millis(BASE_MS * 2 ** (EXPONENTIAL_RETRIES - 1))

/**
 * Retry policy for requests this app makes to the Corehalla API.
 *
 * Six retries: exponential for the first three (200ms, 400ms, 800ms), then
 * that same 800ms interval for the next three.
 */
export const retrySchedule = Schedule.concat(
    Schedule.exponential(Duration.millis(BASE_MS)).pipe(
        Schedule.upTo({ times: EXPONENTIAL_RETRIES }),
    ),
    Schedule.spaced(PLATEAU).pipe(Schedule.upTo({ times: PLATEAU_RETRIES })),
)

export const withRetry = (client: HttpClient.HttpClient) =>
    HttpClient.transform(client, (effect) =>
        effect.pipe(
            Effect.retry({
                schedule: retrySchedule,
                while: HttpClientError.isHttpClientError,
            }),
        ),
    )
