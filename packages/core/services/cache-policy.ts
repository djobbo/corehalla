import type { RankedRegion } from "@crh/bhapi/constants"
import type { Ladder } from "@crh/bhapi/types"

/** Shared by gateway readers and crawler writers — mismatched keys/windows are silent. */
export type CacheWindow = {
    readonly freshSeconds: number
    /** Past fresh: serve immediately and refresh behind; past this: wait for fetch. */
    readonly staleSeconds: number
}

export const cacheTtl = {
    leaderboard: { freshSeconds: 5 * 60, staleSeconds: 6 * 60 * 60 },
    profile: { freshSeconds: 10 * 60, staleSeconds: 24 * 60 * 60 },
} as const satisfies Record<string, CacheWindow>

/**
 * Short shared window for `null` or an empty list ("upstream could not
 * answer"). Must not use resource TTLs — that turns a transient miss, or a
 * failed board, into a long "does not exist" or a blank ladder.
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

    /** Account-level 1v1/legend ratings only. */
    playerRanked1v1: (playerId: number | string): string =>
        `player-ranked-1v1:${playerId}`,

    /** 2v2 team rows, cached apart from the account record. */
    playerTeams: (playerId: number | string): string =>
        `player-teams:${playerId}`,

    /** Crawler-composed record; kept for scripts that warm the whole view. */
    playerRanked: (playerId: number | string): string =>
        `player-ranked:${playerId}`,

    /** Separate from playerRanked — 1v1 and 3v3 are different reads; a shared key would evict. */
    player3v3Ranked: (playerId: number | string): string =>
        `player-3v3-ranked:${playerId}`,

    clan: (clanId: number | string): string => `clan:${clanId}`,
} as const
