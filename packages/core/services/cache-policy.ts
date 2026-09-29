import type { RankedRegion } from "@crh/bhapi/constants"
import type { Ladder } from "@crh/bhapi/types"

/** Shared by gateway readers and crawler writers — mismatched keys/windows are silent. */
export type CacheWindow = {
    readonly freshSeconds: number
    /** Past fresh: serve immediately and refresh behind; past this: wait for fetch. */
    readonly staleSeconds: number
}

export const cacheTtl = {
    leaderboard: { freshSeconds: 120, staleSeconds: 2 * 60 * 60 },
    profile: { freshSeconds: 300, staleSeconds: 24 * 60 * 60 },
} as const satisfies Record<string, CacheWindow>

/**
 * Short shared window for `null` ("upstream could not answer"). Must not use
 * resource TTLs — that turns a transient miss into a long "does not exist".
 * No serve-stale: staleUntil equals freshUntil.
 */
export const emptyTtl: CacheWindow = {
    freshSeconds: 60,
    staleSeconds: 60,
}

export const cacheKeys = {
    /** `name` → `""` so crawler and unfiltered gateway share one key. */
    leaderboard: (
        bracket: Ladder,
        region: RankedRegion,
        page: number,
        name?: string,
    ): string => `lb:${bracket}:${region}:${page}:${name ?? ""}`,

    /** Career stats only — clan is a separate key so the crawler can warm this half. */
    playerStats: (playerId: number | string): string =>
        `player-stats:${playerId}`,

    playerClan: (playerId: number | string): string =>
        `player-clan:${playerId}`,

    playerRanked: (playerId: number | string): string =>
        `player-ranked:${playerId}`,

    /** Separate from playerRanked — v0/v1 serve different modes; shared key would evict. */
    player3v3Ranked: (playerId: number | string): string =>
        `player-3v3-ranked:${playerId}`,

    clan: (clanId: number | string): string => `clan:${clanId}`,
} as const
