import { Context, Effect, Layer } from "effect"
import { cacheNamespace } from "../env"
import { allowRefresh, UPSTREAM_LIMIT_KEY } from "./rate-limit"
import { emptyTtl } from "./cache-policy"
import type { KVNamespaceLike } from "../env"
import type { CacheWindow } from "./cache-policy"

/**
 * Read-through cache for upstream payloads, with a stale tier.
 *
 * Two storage tiers, because they fail differently:
 *
 * - **L1** is a per-isolate `Map`. It costs nothing and absorbs the repeats a
 *   single isolate sees, but it is not shared and disappears with the isolate.
 * - **L2** is the Cloudflare KV namespace. It is shared across colos, which is
 *   the point — but KV is *eventually consistent*, so a value written in one
 *   colo may lag in another. Fine for caching upstream reads; not fine for
 *   anything needing read-after-write, which is why the rate limiter is not
 *   built on it.
 *
 * ## Freshness is tracked separately from retention
 *
 * An entry carries its own `freshUntil`, while the store retains it for a
 * longer `staleSeconds`. That split is what makes "serve stale when over
 * budget" possible: a value past `freshUntil` is not what we would choose to
 * serve, but it beats an error, so it stays available to a caller that has run
 * out of budget.
 *
 * ## Readers and writers
 *
 * `getOrSet` is the reader's entry point (and populates on a miss). `set` exists
 * for the **crawler**, which must not read through this cache — it is the
 * refresh path, so a cached page would mean never re-reading the ladder — but
 * *should* write to it, so the work it does makes user requests cheaper. Keys
 * and windows come from `cache-policy` so the two sides cannot disagree.
 *
 * Every storage interaction is failure-tolerant: a KV error or an envelope that
 * no longer parses degrades to a miss rather than failing the request.
 */
export class Cache extends Context.Service<
    Cache,
    {
        /**
         * Returns a cached value, refreshing it when stale and the caller still
         * has budget.
         *
         * `refresh` is consulted only when an entry needs refreshing. When it
         * resolves `false` (over budget) a stale entry is served instead; with
         * nothing to serve there is no non-outage option, so the effect runs
         * anyway — deliberately, so a cold cache cannot take the site down.
         */
        readonly getOrSet: <A>(
            key: string,
            options: CacheWindow,
            effect: Effect.Effect<A>,
            refresh?: Effect.Effect<boolean>,
        ) => Effect.Effect<A>
        /** Stores a value without reading. Used by the crawler. */
        readonly set: <A>(
            key: string,
            value: A,
            options: CacheWindow,
        ) => Effect.Effect<void>
        /** Drops a key from both tiers. */
        readonly invalidate: (key: string) => Effect.Effect<void>
    }
>()("app/Cache") {}

/**
 * How many entries one isolate keeps in L1.
 *
 * The worker serves a small set of hot keys (the default leaderboard pages), so
 * a modest cap captures nearly all of the benefit. The map is cleared wholesale
 * when exceeded rather than evicted LRU-style: entries are cheap to rebuild and
 * a clear is one operation instead of a bookkeeping pass.
 */
const L1_LIMIT = 256

type L1Entry = {
    readonly value: unknown
    readonly freshUntil: number
    readonly staleUntil: number
}

/** The envelope stored in KV: the value plus when it stops being current. */
type Envelope = { readonly value: unknown; readonly freshUntil: number }

/**
 * Builds the cache over a namespace resolver.
 *
 * The resolver is a parameter rather than a direct import so the cache can be
 * exercised against a fake namespace — production passes `cacheNamespace`, which
 * reads the Worker binding lazily because bindings do not exist at module scope.
 *
 * The L1 map is created *here*, not at module scope, so two instances are
 * genuinely independent. Sharing it would mean a second instance could never be
 * shown to read from KV, which is exactly the tier a cache-warming test needs to
 * exercise.
 */
export const make = (
    resolveNamespace: () => Promise<KVNamespaceLike | undefined>,
) => {
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

    const write = (
        kv: KVNamespaceLike,
        key: string,
        value: unknown,
        options: CacheWindow,
    ) =>
        Effect.tryPromise(() =>
            kv.put(
                key,
                JSON.stringify({
                    value,
                    freshUntil: Date.now() + options.freshSeconds * 1000,
                }),
                // Retention, not freshness: freshness lives inside the envelope
                // so the serve-stale window is ours to choose.
                { expirationTtl: options.staleSeconds },
            ),
        ).pipe(Effect.catch(() => Effect.void))

    const cache = {
        getOrSet: <A>(
            key: string,
            options: CacheWindow,
            effect: Effect.Effect<A>,
            refresh?: Effect.Effect<boolean>,
        ) =>
            Effect.gen(function* () {
                const now = Date.now()

                // L1 first: no I/O at all on the hot path.
                const local = l1Get(key, now)
                if (local && local.freshUntil > now) {
                    return local.value as A
                }

                const kv = yield* Effect.promise(() => resolveNamespace())

                let found: { value: unknown; fresh: boolean } | null = local
                    ? { value: local.value, fresh: false }
                    : null

                // L2: only consulted when L1 missed or went stale.
                if (!local && kv) {
                    const raw = yield* Effect.tryPromise(() =>
                        kv.get(key),
                    ).pipe(Effect.catch(() => Effect.succeed(null)))

                    if (raw !== null) {
                        const envelope = yield* Effect.try({
                            try: () => JSON.parse(raw) as Envelope,
                            catch: () => null,
                        }).pipe(Effect.catch(() => Effect.succeed(null)))

                        if (envelope) {
                            found = {
                                value: envelope.value,
                                fresh: envelope.freshUntil > now,
                            }
                        }
                    }
                }

                if (found?.fresh) return found.value as A

                // Stale or absent: the point that may cost a request, so the
                // only place the budget is consulted. The default gate lives
                // here rather than at each call site so a newly cached operation
                // cannot forget to consult it.
                const mayRefresh =
                    refresh === undefined
                        ? yield* allowRefresh(UPSTREAM_LIMIT_KEY)
                        : yield* refresh

                if (!mayRefresh) {
                    if (found) {
                        yield* Effect.logDebug(
                            `Over budget; serving stale ${key}`,
                        )
                        // Deliberately not re-stored: freshness must not be
                        // pushed forward by a stale read, or the entry would
                        // never expire.
                        return found.value as A
                    }

                    yield* Effect.logWarning(
                        `Over budget with no cached ${key}; fetching anyway`,
                    )
                }

                const value = yield* effect

                /*
                 * A `null` is this codebase's "the upstream could not answer"
                 * sentinel rather than a finding, so it is stored on
                 * `emptyTtl` instead of on the window its resource asked for.
                 * Without this an absence is cached with all the confidence of
                 * a value — see that constant for the failure it caused.
                 */
                yield* cache.set(
                    key,
                    value,
                    value === null ? emptyTtl : options,
                )

                return value
            }),

        set: <A>(key: string, value: A, options: CacheWindow) =>
            Effect.gen(function* () {
                const now = Date.now()
                const kv = yield* Effect.promise(() => resolveNamespace())

                if (kv) yield* write(kv, key, value, options)

                l1Set(key, {
                    value,
                    freshUntil: now + options.freshSeconds * 1000,
                    staleUntil: now + options.staleSeconds * 1000,
                })
            }),

        invalidate: (key: string) =>
            Effect.gen(function* () {
                l1.delete(key)

                const kv = yield* Effect.promise(() => resolveNamespace())

                if (kv) {
                    yield* Effect.tryPromise(() => kv.delete(key)).pipe(
                        Effect.catch(() => Effect.void),
                    )
                }
            }),
    }

    return cache
}

/** A Cache layer over an explicit namespace resolver. */
export const layerFrom = (
    resolveNamespace: () => Promise<KVNamespaceLike | undefined>,
): Layer.Layer<Cache> => Layer.succeed(Cache, make(resolveNamespace))

/** The production layer: reads the `CACHE` binding lazily, per call. */
export const layer = layerFrom(cacheNamespace)
