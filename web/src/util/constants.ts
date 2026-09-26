export const MAX_SHOWN_ALIASES = 5

/**
 * Pagination sizes for the rankings endpoints.
 *
 * Declared locally so the Start app does not depend on a shared server package.
 */
export const SEARCH_PLAYERS_ALIASES_PER_PAGE = 50
export const CLANS_RANKINGS_PER_PAGE = import.meta.env.DEV ? 3 : 50
export const GLOBAL_PLAYER_RANKINGS_PER_PAGE = 50
export const GLOBAL_LEGENDS_RANKINGS_PER_PAGE = 50
export const GLOBAL_WEAPONS_RANKINGS_PER_PAGE = 50

/**
 * Page size of Brawlhalla's own rankings endpoints.
 *
 * Those pages are served by the upstream API, not by us, so this only exists to
 * keep the displayed rank numbers continuous across pages in the paginated
 * table (see `PaginatedRankings`). It is the size the API returns per page.
 */
export const RANKINGS_1V1_PER_PAGE = 50
export const RANKINGS_2V2_PER_PAGE = 50

/**
 * How deep a text search may page before the database refuses it.
 *
 * `OFFSET` walks every skipped index entry, so page `N` costs `N * pageSize`
 * rows read no matter how good the index is. A name search is a jump-to-result
 * interaction, not a corpus to browse, so the depth is capped and the UI treats
 * the cap as the end of the results.
 *
 * The cap is a *database* limit first: the page size is endpoint-specific and
 * can be 3 rows in dev, so counting pages here rather than rows keeps the
 * actual offset bounded per endpoint.
 */
export const SEARCH_MAX_PAGES = 20

/**
 * How many name-ordered clans are considered when re-ranking a prefix search
 * by `xp`.
 *
 * The prefix filter and the `xp` sort disagree, and SQLite cannot serve both
 * from one index, so the candidates are read in name order (one index range)
 * and sorted in the app. Capping the window is what keeps that bounded; the
 * consequence is that "top clans" means "top of the first N names".
 */
export const CLANS_SEARCH_MAX_CANDIDATES = 500
