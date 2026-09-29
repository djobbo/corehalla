import { Effect } from "effect"
import { rateLimitBinding } from "../env"

/** Per-colo, eventually consistent; fails open. Not exact accounting. */
export const allowRefresh = (key: string): Effect.Effect<boolean> =>
    Effect.gen(function* () {
        const binding = yield* Effect.promise(() => rateLimitBinding())

        if (!binding) return true

        const result = yield* Effect.tryPromise(() =>
            binding.limit({ key }),
        ).pipe(Effect.catch(() => Effect.succeed(null)))

        if (result === null) {
            yield* Effect.logWarning(
                `Rate limit binding failed for "${key}"; allowing`,
            )

            return true
        }

        return result.success
    })

/** One key for all upstream reads — the budget is the API key's, not per-resource. */
export const UPSTREAM_LIMIT_KEY = "brawlhalla-upstream"
