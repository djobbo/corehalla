import { Context, Effect, Layer } from "effect"
import { cacheNamespace } from "../env"

/**
 * Read-through cache for upstream payloads.
 *
 * Two tiers, because they fail differently:
 *
 * - **L1** is a per-isolate `Map`. It costs nothing and absorbs the repeated
 *   reads a single worker isolate sees, but it is not shared and disappears
 *   with the isolate.
 * - **L2** is the Cloudflare KV namespace. It is shared across colos, which is
 *   the point — but KV is *eventually consistent*, so a value written here may
 *   not be visible to another colo immediately. That is fine for caching
 *   upstream reads and would not be fine for anything that needs a read-after-
 *   write guarantee, which is why the rate limiter does not use it.
 *
 * Every KV interaction is failure-tolerant: a cache is an optimisation, so a
 * KV error falls through to the underlying effect rather than failing the
 * request. The same goes for a value that cannot be parsed — a schema change
 * must degrade to a miss, not to an error.
 */
export class Cache extends Context.Service<
    Cache,
    {
        /**
         * Returns the cached value for `key`, otherwise runs `effect` and
         * stores the result for `ttlSeconds`.
         */
        readonly getOrSet: <A>(
            key: string,
            ttlSeconds: number,
            effect: Effect.Effect<A>,
        ) => Effect.Effect<A>
        /** Drops a key from both tiers. */
        readonly invalidate: (key: string) => Effect.Effect<void>
    }
>()("app/Cache") {}

/**
 * How many entries one isolate keeps in L1.
 *
 * The worker serves a small set of hot keys (the default leaderboard pages),
 * so a modest cap captures nearly all of the benefit. The map is cleared
 * wholesale when it is exceeded rather than evicted LRU-style: the entries are
 * cheap to rebuild and a clear is one operation instead of a bookkeeping pass.
 */
const L1_LIMIT = 256

type L1Entry = { readonly value: unknown; readonly expiresAt: number }

const l1 = new Map<string, L1Entry>()

const l1Get = (key: string, now: number): L1Entry | undefined => {
    const entry = l1.get(key)

    if (!entry) return undefined
    if (entry.expiresAt <= now) {
        l1.delete(key)
        return undefined
    }

    return entry
}

const l1Set = (key: string, value: unknown, expiresAt: number): void => {
    if (l1.size >= L1_LIMIT) l1.clear()

    l1.set(key, { value, expiresAt })
}

export const layer = Layer.succeed(Cache, {
    getOrSet: (key, ttlSeconds, effect) =>
        Effect.gen(function* () {
            const now = Date.now()

            const hit = l1Get(key, now)
            if (hit) return hit.value as never

            const kv = yield* Effect.promise(() => cacheNamespace())

            if (kv) {
                const raw = yield* Effect.tryPromise(() => kv.get(key)).pipe(
                    Effect.catch(() => Effect.succeed(null)),
                )

                if (raw !== null) {
                    const parsed = yield* Effect.try({
                        try: () => JSON.parse(raw) as never,
                        catch: () => null,
                    }).pipe(Effect.catch(() => Effect.succeed(null)))

                    // A stored value that no longer parses is treated as a
                    // miss rather than an error.
                    if (parsed !== null) {
                        l1Set(key, parsed, now + ttlSeconds * 1000)
                        return parsed
                    }
                }
            }

            const value = yield* effect

            if (kv) {
                yield* Effect.tryPromise(() =>
                    kv.put(key, JSON.stringify(value), {
                        expirationTtl: ttlSeconds,
                    }),
                ).pipe(Effect.catch(() => Effect.void))
            }

            l1Set(key, value, now + ttlSeconds * 1000)

            return value
        }),

    invalidate: (key) =>
        Effect.gen(function* () {
            l1.delete(key)

            const kv = yield* Effect.promise(() => cacheNamespace())

            if (kv) {
                yield* Effect.tryPromise(() => kv.delete(key)).pipe(
                    Effect.catch(() => Effect.void),
                )
            }
        }),
})
