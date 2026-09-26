import { Effect } from "effect"
import { rateLimitBinding } from "../env"

/**
 * Whether an upstream refresh is currently allowed.
 *
 * Backed by Cloudflare's native rate-limiting binding rather than a Durable
 * Object or a shared counter table. That is a deliberate trade:
 *
 * - The binding is **per-colo and eventually consistent**. Cloudflare documents
 *   it as protection against overwhelming an upstream, not as exact accounting,
 *   so each colo gets its own budget and the aggregate can exceed the configured
 *   number.
 * - In exchange there is no new stateful resource, no cross-colo round trip on
 *   the request path, and no hot-key counter to keep correct. A Durable Object
 *   would have been exact, but would have put a single-region hop in front of
 *   every refresh — and hosting one would have forced this worker's entry into
 *   Alchemy's Effect-native `Worker.make()` form.
 *
 * The cache already removed most of the pressure, so this is a burst damper: it
 * stops a hot key from draining the shared Brawlhalla budget, and it is not a
 * meter. The configured limit is deliberately far above normal per-colo traffic,
 * which is a handful of requests a minute once the cache is warm.
 *
 * ## Why a plain effect and not a service
 *
 * There is nothing to inject: the binding is read lazily from the environment
 * and it carries its own configuration. A `Context.Service` here would be
 * indirection with no seam, so this is a module-level effect — consumed by the
 * cache, which is where the refresh decision belongs.
 *
 * ## Failure behaviour
 *
 * Fails **open**. An unbound binding or a binding error resolves to "allowed".
 * Losing the damper beats a self-inflicted outage, and the cost of being wrong
 * is paid against the upstream budget rather than by the user.
 */
export const allowRefresh = (key: string): Effect.Effect<boolean> =>
    Effect.gen(function* () {
        const binding = yield* Effect.promise(() => rateLimitBinding())

        // Unbound: local runs, and any deploy without the binding.
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

/**
 * The key the upstream budget is counted under.
 *
 * A single key for all upstream reads, because the budget being protected is
 * the API key's, not a per-resource quota. Counting per resource would let each
 * resource independently drain the same allowance.
 */
export const UPSTREAM_LIMIT_KEY = "brawlhalla-upstream"
