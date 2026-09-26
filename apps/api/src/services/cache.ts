import { Context, Effect, Layer } from "effect"
import { cacheNamespace } from "../env"

/**
 * Read-through cache for upstream payloads, with a stale tier.
 *
 * Two storage tiers, because they fail differently:
 *
 * - **L1** is a per-isolate `Map`. It costs nothing and absorbs the repeats a
 *   single isolate sees, but it is not shared and disappears with the isolate.
 * - **L2** is the Cloudflare KV namespace. It is shared across colos, which is
 *   the point — but KV is *eventually consistent*, so a value written in one
 *   colo may lag in another. That is fine for caching upstream reads and would
 *   not be fine for anything needing read-after-write, which is why the rate
 *   limiter is not built on it.
 *
 * ## Freshness is tracked separately from retention
 *
 * An entry carries its own `freshUntil`, and the backing store keeps it for a
 * longer `staleSeconds`. That split is what makes "serve stale when over
 * budget" possible: a value past `freshUntil` is no longer what we would
 * choose to serve, but it is far better than an error, so it stays available
 * for the caller that has run out of upstream budget.
 *
 * Every storage interaction is failure-tolerant. A cache is an optimisation, so
 * a KV error or an envelope that no longer parses degrades to a miss rather
 * than failing the request.
 */
export class Cache extends Context.Service<
    Cache,
    {
        /**
         * Returns a cached value, refreshing it when it is stale and the caller
         * still has budget.
         *
         * `refresh` is consulted only when an entry needs refreshing. When it
         * resolves `false` (over budget) a stale entry is served instead; with
         * nothing to serve there is no non-outage option, so the effect runs
         * anyway. That is deliberate — a cold cache must not be able to take the
         * site down — and it is the one path that can exceed the budget.
         */
        readonly getOrSet: <A>(
            key: string,
            options: {
                /** How long a value is considered current. */
                readonly freshSeconds: number
                /** How long it is retained for the serve-stale path. */
                readonly staleSeconds: number
            },
            effect: Effect.Effect<A>,
            refresh?: Effect.Effect<boolean>,
        ) => Effect.Effect<A>
        /** Drops a key from both tiers. */
        readonly invalidate: (key: string) => Effect.Effect<void>
    }
>()("app/Cache") {}

/**
 * How many entries one isolate keeps in L1.
 *
 * The worker serves a small set of hot keys (the default leaderboard pages), so
 * a modest cap captures nearly all of the benefit. The map is cleared wholesale
 * when exceeded rather than evicted LRU-style: the entries are cheap to rebuild
 * and a clear is one operation instead of a bookkeeping pass.
 */
const L1_LIMIT = 256

type L1Entry = {
    readonly value: unknown
    readonly freshUntil: number
    readonly staleUntil: number
}

const l1 = new Map<string, L1Entry>()

const l1Get = (key: string, now: number): L1Entry | undefined => {
    const entry = l1.get(key)

    if (!entry) return undefined

    if (entry.staleUntil <= now) {
        l1.delete(key)
        return undefined
    }

    return entry
}

const l1Set = (key: string, entry: L1Entry): void => {
    if (l1.size >= L1_LIMIT) l1.clear()

    l1.set(key, entry)
}

/** The envelope stored in KV: the value plus when it stops being current. */
type Envelope = { readonly value: unknown; readonly freshUntil: number }

type Found = {
    readonly value: unknown
    readonly fresh: boolean
}

export const layer = Layer.succeed(Cache, {
    getOrSet: (key, options, effect, refresh) =>
        Effect.gen(function* () {
            const now = Date.now()

            // L1 first: no I/O at all on the hot path.
            const local = l1Get(key, now)
            if (local) {
                const age = local.freshUntil - now
                if (age > 0) return local.value as never
            }

            const kv = yield* Effect.promise(() => cacheNamespace())

            // L2: only consulted when L1 missed or went stale.
            let found: Found | null = local
                ? { value: local.value, fresh: false }
                : null

            if (!local && kv) {
                const raw = yield* Effect.tryPromise(() => kv.get(key)).pipe(
                    Effect.catch(() => Effect.succeed(null)),
                )

                if (raw !== null) {
                    const envelope = yield* Effect.try({
                        try: () => JSON.parse(raw) as Envelope,
                        catch: () => null,
                    }).pipe(Effect.catch(() => Effect.succeed(null)))

                    if (envelope !== null && envelope !== undefined) {
                        found = {
                            value: envelope.value,
                            fresh: envelope.freshUntil > now,
                        }
                    }
                }
            }

            if (found?.fresh) return found.value as never

            // Stale or absent: this is the point that may cost a request, so it
            // is the only place the budget is consulted.
            const mayRefresh = refresh === undefined ? true : yield* refresh

            if (!mayRefresh) {
                if (found) {
                    yield* Effect.logDebug(
                        `Over budget; serving stale ${key}`,
                    )
                    // Deliberately not re-stored: freshness must not be pushed
                    // forward by a stale read, or the entry would never expire.
                    return found.value as never
                }

                yield* Effect.logWarning(
                    `Over budget with no cached ${key}; fetching anyway`,
                )
            }

            const value = yield* effect

            const freshUntil = Date.now() + options.freshSeconds * 1000
            const staleUntil = Date.now() + options.staleSeconds * 1000

            if (kv) {
                yield* Effect.tryPromise(() =>
                    kv.put(key, JSON.stringify({ value, freshUntil }), {
                        // Retention, not freshness: freshness lives inside the
                        // envelope so the serve-stale window is ours to choose.
                        expirationTtl: options.staleSeconds,
                    }),
                ).pipe(Effect.catch(() => Effect.void))
            }

            l1Set(key, { value, freshUntil, staleUntil })

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
