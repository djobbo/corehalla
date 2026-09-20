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
