import { Context, Effect, Layer } from "effect"
import { cacheNamespace } from "../env"
import { Background } from "./background"
import { allowRefresh, UPSTREAM_LIMIT_KEY } from "./rate-limit"
import { emptyTtl } from "./cache-policy"
import type { BackgroundShape } from "./background"
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
 * longer `staleSeconds` (`staleUntil`). That split produces three outcomes, and
 * the reader never has to wait unless there is nothing else to do:
 *
 * - **Fresh** — answer from the entry and touch nothing else.
 * - **Stale but retained** — answer from the stale entry *now* and refresh
 *   behind the response, so the next reader gets something current instead of
 *   the same wait. The refresh is handed to `Background`, because on Workers a
 *   fiber the platform cannot see is cancelled the moment the response returns.
 * - **Gone** — no entry at all, or one past `staleUntil`. There is nothing to
 *   answer with, so the caller waits for the fetch.
 *
 * The budget damper is consulted only in the middle case, and only to decide
 * whether to refresh: being over budget turns a stale read into a stale read
 * with no refresh, never into an error or a wait.
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
         * Returns a cached value, refreshing it when it is stale.
         *
         * Three cases, in the order the store is consulted: a fresh entry is
         * returned as-is; a stale entry still inside its retention window is
         * returned immediately and refreshed in the background; anything else —
         * absent, or stale past retention — is fetched before returning, since
         * there is no answer to give in the meantime.
         *
         * `refresh` is consulted only for the middle case, to decide whether the
         * background refresh may run. When it resolves `false` (over budget) the
         * stale entry is still served, just without a refresh. When there is
         * nothing to serve the budget is not consulted at all: the only
         * alternatives would be an error or an outage, and neither is a cache
         * policy.
         */
        readonly getOrSet: <A>(
            key: string,
            options: CacheWindow,
            effect: Effect.Effect<A>,
            refresh?: Effect.Effect<boolean>,
        ) => Effect.Effect<A>
        /**
         * {@link getOrSet}, plus when the answer was actually fetched.
         *
         * The timestamp is what lets an aggregate report the age of its oldest
         * part rather than the moment it was assembled — see `Cached`. It is the
         * entry's own write time, so a value served from a stale entry reports
         * when that entry was fetched, not now.
         */
        readonly getOrSetCached: <A>(
            key: string,
            options: CacheWindow,
            effect: Effect.Effect<A>,
            refresh?: Effect.Effect<boolean>,
        ) => Effect.Effect<Cached<A>>
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
 * A cached value and the age of the upstream answer behind it.
 *
 * `updatedAt` is epoch milliseconds of the **fetch**, not of the read: a fresh
 * entry keeps the time it was written, and a stale entry that is served while a
 * refresh runs reports the stale fetch. That is the whole point — a page built
 * from several cached reads can report the oldest of them instead of the moment
 * it happened to be assembled, which is what stops a response from claiming to
 * be newer than the data in it.
 */
export type Cached<A> = {
    readonly value: A
    readonly updatedAt: number
}

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
    /** When the value was fetched, which is what its age is measured from. */
    readonly storedAt: number
    readonly freshUntil: number
    readonly staleUntil: number
}

/**
 * The envelope stored in KV: the value plus when it stops being current and
 * when it stops being usable.
 *
 * `staleUntil` is optional because envelopes written before it existed do not
 * carry one. Such an entry is still trusted while it is fresh, but once stale
 * its retention is unknown, so it is refetched rather than served on a window
 * nobody recorded.
 *
 * `storedAt` is optional for the same reason, and is reconstructed from
 * `freshUntil` when it is missing — see `storedAtOf`.
 */
type Envelope = {
    readonly value: unknown
    readonly storedAt?: number
    readonly freshUntil: number
    readonly staleUntil?: number
}

/**
 * How the cache hands a refresh to the platform.
 *
 * `Background`'s `run`, and the cache is deliberately built with it rather than
 * around it: `Effect.forkDetach` would return before the refresh finished, but
 * on Workers the runtime would also cancel it when the response returns.
 * Threading the scheduler through `make` keeps the cache testable — a test can
 * run the refresh on its own fiber — without a second way to detach work.
 */
type Schedule = BackgroundShape["run"]

/**
 * Builds the cache over a namespace resolver and a background scheduler.
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
    schedule: Schedule,
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
        at: number,
    ) =>
        Effect.tryPromise(() => {
            return kv.put(
                key,
                JSON.stringify({
                    value,
                    storedAt: at,
                    freshUntil: at + options.freshSeconds * 1000,
                    staleUntil: at + options.staleSeconds * 1000,
                }),
                // Retention, not freshness: freshness lives inside the envelope
                // so the stale window is ours to choose. `staleUntil` is stored
                // too, because KV expiry is eventually consistent — it is the
                // envelope, not the TTL, that decides when an entry is too old
                // to serve.
                { expirationTtl: options.staleSeconds },
            )
        }).pipe(Effect.catch(() => Effect.void))

    /**
     * When an envelope was fetched, for envelopes written before `storedAt`.
     *
     * `freshUntil` is always `storedAt + freshSeconds`, so the write time is
     * recoverable exactly as long as we know which window was used — and we do,
     * because a `null` is stored on `emptyTtl` and everything else on the
     * resource's own window.
     */
    const storedAtOf = (
        envelope: Envelope,
        value: unknown,
        options: CacheWindow,
    ): number => {
        if (typeof envelope.storedAt === "number") return envelope.storedAt

        const window = value === null ? emptyTtl : options

        return envelope.freshUntil - window.freshSeconds * 1000
    }

    /**
     * Stores a value at a known instant.
     *
     * The instant is a parameter rather than `Date.now()` taken here so the
     * timestamp a read *reports* is the timestamp the entry was *stored* with.
     * Deriving both from separate clock reads makes them disagree by the
     * duration of the fetch, which would make `updatedAt` drift on every read.
     */
    const setAt = <A>(
        key: string,
        value: A,
        options: CacheWindow,
        at: number,
        kv: KVNamespaceLike | undefined,
    ) =>
        Effect.gen(function* () {
            if (kv) yield* write(kv, key, value, options, at)

            l1Set(key, {
                value,
                storedAt: at,
                freshUntil: at + options.freshSeconds * 1000,
                staleUntil: at + options.staleSeconds * 1000,
            })
        })

    /**
     * Stores a fetched value, downgrading a `null` to `emptyTtl`.
     *
     * A `null` is this codebase's "the upstream could not answer" sentinel
     * rather than a finding, so it is stored on `emptyTtl` instead of on the
     * window its resource asked for. Without this an absence is cached with all
     * the confidence of a value — see that constant for the failure it caused.
     */
    const store = <A>(
        key: string,
        value: A,
        options: CacheWindow,
        at: number,
        kv: KVNamespaceLike | undefined,
    ) =>
        setAt(key, value, value === null ? emptyTtl : options, at, kv)

    const cache = {
        getOrSet: <A>(
            key: string,
            options: CacheWindow,
            effect: Effect.Effect<A>,
            refresh?: Effect.Effect<boolean>,
        ) =>
            cache
                .getOrSetCached(key, options, effect, refresh)
                .pipe(Effect.map((cached) => cached.value)),

        getOrSetCached: <A>(
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
                    return {
                        value: local.value as A,
                        updatedAt: local.storedAt,
                    }
                }

                const kv = yield* Effect.promise(() => resolveNamespace())

                let found: {
                    value: unknown
                    fresh: boolean
                    storedAt: number
                    freshUntil: number
                    staleUntil: number
                } | null = local
                    ? {
                          value: local.value,
                          fresh: false,
                          storedAt: local.storedAt,
                          freshUntil: local.freshUntil,
                          staleUntil: local.staleUntil,
                      }
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
                            const fresh = envelope.freshUntil > now

                            /*
                             * An envelope written before `staleUntil` existed
                             * reports `undefined`, which is not `> now`: the
                             * entry is still served while fresh, but once stale
                             * it is refetched rather than trusted for a window
                             * nobody recorded.
                             */
                            const retained = (envelope.staleUntil ?? 0) > now

                            if (fresh || retained) {
                                const storedAt = storedAtOf(
                                    envelope,
                                    envelope.value,
                                    options,
                                )
                                const staleUntil =
                                    envelope.staleUntil ?? envelope.freshUntil

                                /*
                                 * A KV hit is promoted into L1. Without this the
                                 * isolate pays a KV read for the same entry on
                                 * every request: L1 was only ever filled by a
                                 * fetch this isolate made, so a colo serving a
                                 * crawler-warmed key read through to KV
                                 * forever.
                                 */
                                l1Set(key, {
                                    value: envelope.value,
                                    storedAt,
                                    freshUntil: envelope.freshUntil,
                                    staleUntil,
                                })

                                found = {
                                    value: envelope.value,
                                    fresh,
                                    storedAt,
                                    freshUntil: envelope.freshUntil,
                                    staleUntil,
                                }
                            }
                        }
                    }
                }

                if (found?.fresh) {
                    return { value: found.value as A, updatedAt: found.storedAt }
                }

                /*
                 * Stale but retained: answer now and refresh behind the
                 * response. The entry is already stored, so the refresh is not
                 * there to answer this request — it is there to make the next
                 * one current, which is what keeps the wait from landing on
                 * every reader in turn.
                 */
                if (found) {
                    const mayRefresh =
                        refresh === undefined
                            ? yield* allowRefresh(UPSTREAM_LIMIT_KEY)
                            : yield* refresh

                    if (mayRefresh) {
                        yield* Effect.logDebug(
                            `Serving stale ${key}; refreshing behind the response`,
                        )

                        yield* schedule(
                            effect.pipe(
                                Effect.flatMap((value) =>
                                    store(
                                        key,
                                        value,
                                        options,
                                        Date.now(),
                                        kv,
                                    ),
                                ),
                            ),
                        )
                    } else {
                        yield* Effect.logDebug(
                            `Over budget; serving stale ${key} without refreshing`,
                        )
                    }

                    // Deliberately not re-stored: freshness must not be pushed
                    // forward by a stale read, or the entry would never expire.
                    // The reported age is the stale entry's, not now — that is
                    // the whole point of reporting it.
                    return { value: found.value as A, updatedAt: found.storedAt }
                }

                /*
                 * Nothing to serve — absent, or stale past `staleUntil`. The
                 * budget is not consulted: it exists to choose between a
                 * refresh and a stale answer, and there is no stale answer to
                 * choose. The alternatives here are a fetch or an outage, and
                 * an outage is not a cache policy.
                 */
                const fetchedAt = Date.now()
                const value = yield* effect

                yield* store(key, value, options, fetchedAt, kv)

                return { value, updatedAt: fetchedAt }
            }),

        set: <A>(key: string, value: A, options: CacheWindow) =>
            Effect.gen(function* () {
                const kv = yield* Effect.promise(() => resolveNamespace())

                yield* setAt(key, value, options, Date.now(), kv)
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

/**
 * A Cache layer over an explicit namespace resolver.
 *
 * Requires `Background` rather than building one, because the refresh it
 * schedules has to be kept alive by the same mechanism — and provided by the
 * same layer — as every other write that outlives a response. A Node entry
 * point with no request lifetime provides `Background.inlineLayer`; the Worker
 * provides the detaching one.
 */
export const layerFrom = (
    resolveNamespace: () => Promise<KVNamespaceLike | undefined>,
): Layer.Layer<Cache, never, Background> =>
    Layer.effect(
        Cache,
        Effect.gen(function* () {
            const background = yield* Background

            return make(resolveNamespace, background.run)
        }),
    )

/** The production layer: reads the `CACHE` binding lazily, per call. */
export const layer = layerFrom(cacheNamespace)
