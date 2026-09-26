import type { RankedRegion } from "@crh/bhapi/constants"
import type { Ladder } from "@crh/bhapi/types"

/**
 * Cache keys and windows, in one place.
 *
 * These are shared by the two sides of the cache — the request gateway, which
 * *reads* entries, and the crawler, which *writes* them. If either side built
 * its own key, the crawler would warm keys nobody reads and the cache would
 * look cold no matter how much crawling happened. That failure is silent, so
 * the key is derived from one function rather than spelled twice.
 *
 * The same argument applies to the windows: a crawler that wrote an entry with
 * a shorter freshness than the reader expects would produce hits that are
 * treated as stale on arrival.
 */

/** Windows per resource, in seconds. */
export type CacheWindow = {
    /** When a value stops being current. */
    readonly freshSeconds: number
    /** How long it is retained afterwards, for the serve-stale path. */
    readonly staleSeconds: number
}

export const cacheTtl = {
    /**
     * A ladder page moves constantly and is cheap to refetch, so it stays fresh
     * for a minute but lingers for fifteen so the serve-stale path has
     * something to return.
     */
    leaderboard: { freshSeconds: 60, staleSeconds: 15 * 60 },
    /**
     * A profile changes slowly and costs more to assemble (a v1 profile is up
     * to two upstream calls), so it keeps the five minutes the old edge
     * `Cache-Control` used, and lingers for an hour.
     */
    profile: { freshSeconds: 300, staleSeconds: 60 * 60 },
} as const satisfies Record<string, CacheWindow>

export const cacheKeys = {
    /**
     * A ladder page.
     *
     * `name` is normalised to the empty string rather than left `undefined`, so
     * the crawler (which never passes one) and the gateway (which omits it for
     * an unfiltered page) produce the same key. A `?q=` search would otherwise
     * warm a different key than the plain page it was filtered from.
     */
    leaderboard: (
        bracket: Ladder,
        region: RankedRegion,
        page: number,
        name?: string,
    ): string => `lb:${bracket}:${region}:${page}:${name ?? ""}`,

    player: (playerId: number | string): string => `player:${playerId}`,

    playerRanked: (playerId: number | string): string =>
        `player-ranked:${playerId}`,

    clan: (clanId: number | string): string => `clan:${clanId}`,
} as const
