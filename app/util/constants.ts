const __DEV = process.env.NODE_ENV === "development"

export const SEARCH_PLAYERS_ALIASES_PER_PAGE = 50
export const CLANS_RANKINGS_PER_PAGE = __DEV ? 3 : 50
export const GLOBAL_PLAYER_RANKINGS_PER_PAGE = 50
export const GLOBAL_LEGENDS_RANKINGS_PER_PAGE = 50
export const GLOBAL_WEAPONS_RANKINGS_PER_PAGE = 50
