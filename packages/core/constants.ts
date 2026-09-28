/**
 * Server-side pagination sizes.
 *
 * These mirror the values the Start app renders with so the two stay in step.
 * `SEARCH_MAX_PAGES` and `CLANS_SEARCH_MAX_CANDIDATES` are *database* limits,
 * not display preferences:
 *
 * - `OFFSET` walks every skipped index entry, so page `N` costs `N * pageSize`
 *   rows read no matter how good the index is. A name search is a
 *   jump-to-result interaction, so the depth is capped and the UI treats the
 *   cap as the end of the results.
 * - The clans prefix filter and the `xp` sort disagree, and SQLite cannot serve
 *   both from one index, so candidates are read in name order and re-ranked in
 *   the app. Capping that window is what keeps it bounded.
 */
export const SEARCH_PLAYERS_ALIASES_PER_PAGE = 50
export const CLANS_RANKINGS_PER_PAGE = 50
export const GLOBAL_PLAYER_RANKINGS_PER_PAGE = 50
export const SEARCH_MAX_PAGES = 20
export const CLANS_SEARCH_MAX_CANDIDATES = 500

/**
 * How long a player stays on the ranked queue after we last saw them play.
 *
 * The sampler runs every ten minutes, so half an hour is three passes: long
 * enough that one missed or failed sample does not drop somebody who is still
 * playing, short enough that the list means "playing now" rather than "has
 * played today".
 */
export const RANKED_QUEUE_WINDOW_MS = 30 * 60 * 1000

/**
 * How long a ladder entry is kept without changing.
 *
 * Rows are pruned once the sampler has gone this long without seeing an entry
 * *change*, so the table holds the ladders' current occupants rather than
 * everyone who has ever been in a top 500.
 *
 * Dropping a baseline is safe, and is the point. `queuedAt` is stamped on any
 * increase, so a stale baseline turns a player returning to the ladder after an
 * absence into a queue event that never happened. Pruning removes the stale
 * comparison; the cost is that the first game after a prune is not reported,
 * because the re-inserted row has no previous count to compare against. One
 * missed event beats one invented event, and it only ever affects entries idle
 * for a week.
 */
export const RANKED_QUEUE_RETENTION_MS = 7 * 24 * 60 * 60 * 1000
