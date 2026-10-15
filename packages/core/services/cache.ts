import { Context, Effect, Layer, Option, Schema } from "effect"
import { cacheNamespace } from "../env"
import { Background } from "./background"
import { allowRefresh, UPSTREAM_LIMIT_KEY } from "./rate-limit"
import { emptyTtl } from "./cache-policy"
import type { BackgroundShape } from "./background"
import type { KVNamespaceLike } from "../env"
import type { CacheWindow } from "./cache-policy"

/**
 * Read options. When `schema` is given, cached values (L1 and KV) are decoded
 * against it before serving; a value that no longer matches is treated as a
 * miss so a payload-shape change cannot poison responses until TTL expiry.
 */
export type CacheRead<A> = CacheWindow & {
    readonly schema?: Schema.ConstraintDecoder<A>
}

/**
 * L1 isolate Map + L2 KV (eventually consistent). Fresh vs stale retention are
 * separate: fresh → return; stale within staleUntil → return + Background
 * refresh (budget may skip refresh); gone → await fetch. Crawler uses `set`
 * only — it must not read through this cache.
 */
export class Cache extends Context.Service<
    Cache,
    {
        /** `refresh` only for stale-serve; false = serve stale without refresh. */
        readonly getOrSet: <A>(
            key: string,
            options: CacheRead<A>,
            effect: Effect.Effect<A>,
            refresh?: Effect.Effect<boolean>,
        ) => Effect.Effect<A>
        /** Like getOrSet; `updatedAt` is fetch time, not read time. */
        readonly getOrSetCached: <A>(
            key: string,
            options: CacheRead<A>,
            effect: Effect.Effect<A>,
            refresh?: Effect.Effect<boolean>,
        ) => Effect.Effect<Cached<A>>
        /** Write without read — crawler. */
        readonly set: <A>(
            key: string,
            value: A,
            options: CacheWindow,
        ) => Effect.Effect<void>
        readonly invalidate: (key: string) => Effect.Effect<void>
    }
>()("app/Cache") {}

/** `updatedAt` is fetch epoch ms so aggregates can take the oldest part. */
export type Cached<A> = {
    readonly value: A
    readonly updatedAt: number
}

/** Clear wholesale past this size — hot keys are few; rebuild is cheap. */
const L1_LIMIT = 256

type L1Entry = {
    readonly value: unknown
    readonly storedAt: number
    readonly freshUntil: number
    readonly staleUntil: number
}

/**
 * `staleUntil`/`storedAt` optional for pre-migration envelopes: serve while
 * fresh; once stale, refetch (unknown retention / reconstruct storedAt).
 */
type Envelope = {
    readonly value: unknown
    readonly storedAt?: number
    readonly freshUntil: number
    readonly staleUntil?: number
}

type Schedule = BackgroundShape["run"]

/** `schema` given → decode; decode failure is a miss, not an error. */
const decodeCached = <A>(
    schema: Schema.ConstraintDecoder<A> | undefined,
    value: unknown,
): Option.Option<A> =>
    schema === undefined
        ? Option.some(value as A)
        : Schema.decodeUnknownOption(schema)(value)

/**
 * `null` ("upstream could not answer") and an empty list both use the short
 * `emptyTtl`: a blank result must not be pinned for the resource's window.
 */
const isEmptyResult = (value: unknown): boolean =>
    value === null || (Array.isArray(value) && value.length === 0)

/** L1 is per-instance (not module scope) so tests can isolate KV. */
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
                // KV TTL is retention; envelope staleUntil decides serveability.
                { expirationTtl: options.staleSeconds },
            )
        }).pipe(Effect.catch(() => Effect.void))

    /** Reconstruct pre-`storedAt` envelopes: freshUntil − window (empty → emptyTtl). */
    const storedAtOf = (
        envelope: Envelope,
        value: unknown,
        options: CacheWindow,
    ): number => {
        if (typeof envelope.storedAt === "number") return envelope.storedAt

        const window = isEmptyResult(value) ? emptyTtl : options

        return envelope.freshUntil - window.freshSeconds * 1000
    }

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

    const store = <A>(
        key: string,
        value: A,
        options: CacheWindow,
        at: number,
        kv: KVNamespaceLike | undefined,
    ) => setAt(key, value, isEmptyResult(value) ? emptyTtl : options, at, kv)

    const cache = {
        getOrSet: <A>(
            key: string,
            options: CacheRead<A>,
            effect: Effect.Effect<A>,
            refresh?: Effect.Effect<boolean>,
        ) =>
            cache
                .getOrSetCached(key, options, effect, refresh)
                .pipe(Effect.map((cached) => cached.value)),

        getOrSetCached: <A>(
            key: string,
            options: CacheRead<A>,
            effect: Effect.Effect<A>,
            refresh?: Effect.Effect<boolean>,
        ) =>
            Effect.gen(function* () {
                const now = Date.now()

                let local = l1Get(key, now)

                // A shape change since write invalidates L1 too, not just KV.
                if (
                    local &&
                    Option.isNone(decodeCached(options.schema, local.value))
                ) {
                    yield* Effect.logDebug(
                        `Dropping stale-schema L1 entry ${key}`,
                    )
                    l1.delete(key)
                    local = undefined
                }

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
                            const decoded = decodeCached(
                                options.schema,
                                envelope.value,
                            )
                            const fresh = envelope.freshUntil > now

                            // Missing staleUntil: serve if fresh, else refetch.
                            const retained = (envelope.staleUntil ?? 0) > now

                            if (Option.isSome(decoded) && (fresh || retained)) {
                                const storedAt = storedAtOf(
                                    envelope,
                                    envelope.value,
                                    options,
                                )
                                const staleUntil =
                                    envelope.staleUntil ?? envelope.freshUntil

                                // Promote KV → L1 or crawler-warmed keys never leave L2.
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
                    return {
                        value: found.value as A,
                        updatedAt: found.storedAt,
                    }
                }

                // Stale retained: answer now; refresh behind (not for this request).
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
                                    store(key, value, options, Date.now(), kv),
                                ),
                            ),
                        )
                    } else {
                        yield* Effect.logDebug(
                            `Over budget; serving stale ${key} without refreshing`,
                        )
                    }

                    // Do not re-store — that would push freshness forever.
                    return {
                        value: found.value as A,
                        updatedAt: found.storedAt,
                    }
                }

                // No entry: budget does not apply — fetch or outage.
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

/** Requires Background so refreshes share the same waitUntil path as other writes. */
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

export const layer = layerFrom(cacheNamespace)
