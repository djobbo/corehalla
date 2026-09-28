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
    leaderboard: { freshSeconds: 120, staleSeconds: 60 * 60 },
    /**
     * A profile changes slowly and costs more to assemble (a v1 profile is up
     * to two upstream calls), so it keeps the five minutes the old edge
     * `Cache-Control` used, and lingers for an hour.
     */
    profile: { freshSeconds: 300, staleSeconds: 240 * 60 },
} as const satisfies Record<string, CacheWindow>

/**
 * How long a `null` may stand in for an answer.
 *
 * Deliberately not per-resource. The question this window answers is not "how
 * fast does this data change" — that is what `cacheTtl` is for — but "how much
 * do we trust a missing answer", and that is the same everywhere: very little.
 *
 * `null` is the sentinel this codebase uses for *"the upstream could not
 * answer"*, not for "there is nothing there". `getOptionalJson` collapses a 404
 * and a transport failure into the same value on purpose, and the gateway's
 * fallback chain reads it that way. Storing that on the resource's own window
 * is what turns an absence into a fact: a player v1 404s while v0 has no key
 * configured was recorded as "does not exist" for five minutes fresh and an
 * hour of stale-serving, so the profile kept insisting on it long after
 * upstream would have answered.
 *
 * A minute is short enough that a wrong negative heals on its own, and long
 * enough to absorb a burst of lookups for an id that really is absent — which
 * this must not turn into an upstream call per request, because the common case
 * is not exceptional: most players have no 3v3 record, and that is a `null` on
 * every profile view.
 *
 * There is no serve-stale tier: a stale "we do not know" is worth nothing, so
 * the entry is dropped rather than lingered over.
 */
export const emptyTtl: CacheWindow = {
    freshSeconds: 60,
    staleSeconds: 60,
}

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

    /**
     * A player's 3v3 record.
     *
     * Its own key rather than a suffix on `playerRanked`, because the two are
     * separate upstream reads: v0 serves 2v2 and has no 3v3 mode, while v1
     * serves 3v3 and no 2v2. Sharing one key would make either read evict the
     * other's entry, and the two have no reason to share a freshness.
     */
    player3v3Ranked: (playerId: number | string): string =>
        `player-3v3-ranked:${playerId}`,

    clan: (clanId: number | string): string => `clan:${clanId}`,
} as const
