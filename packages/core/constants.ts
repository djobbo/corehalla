/** Database pagination caps — OFFSET cost and clans re-rank window stay bounded. */
export const SEARCH_PLAYERS_ALIASES_PER_PAGE = 50
export const CLANS_RANKINGS_PER_PAGE = 50
export const GLOBAL_PLAYER_RANKINGS_PER_PAGE = 50
export const SEARCH_MAX_PAGES = 20
export const CLANS_SEARCH_MAX_CANDIDATES = 500

/** Three sampler passes (10 min each); survives one miss, still means "playing now". */
export const RANKED_QUEUE_WINDOW_MS = 30 * 60 * 1000

/**
 * Prune idle ladder baselines after a week so a stale `queuedAt` cannot invent
 * a queue event on return. Cost: the first game after prune is not reported.
 */
export const RANKED_QUEUE_RETENTION_MS = 7 * 24 * 60 * 60 * 1000
