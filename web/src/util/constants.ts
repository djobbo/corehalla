export const MAX_SHOWN_ALIASES = 5

/**
 * Pagination sizes for the rankings endpoints.
 *
 * These mirror `packages/server/helpers/constants.ts`. They are declared
 * locally so the Start app no longer depends on the tRPC server package.
 */
export const SEARCH_PLAYERS_ALIASES_PER_PAGE = 50
export const CLANS_RANKINGS_PER_PAGE = import.meta.env.DEV ? 3 : 50
export const GLOBAL_PLAYER_RANKINGS_PER_PAGE = 50
export const GLOBAL_LEGENDS_RANKINGS_PER_PAGE = 50
export const GLOBAL_WEAPONS_RANKINGS_PER_PAGE = 50
