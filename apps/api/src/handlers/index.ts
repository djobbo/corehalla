/**
 * The server implementations of the `CorehallaApi` contract, one module per
 * group.
 *
 * The split follows the contract: `players` and `guilds` are page aggregates,
 * `rankings` and `search` are the product boards and lookup, `content` is
 * scraped site data, and `upstream` is Brawlhalla's own surface kept verbatim.
 */
export { playersGroup } from "./players"
export { guildsGroup } from "./guilds"
export { rankingsGroup } from "./rankings"
export { searchGroup } from "./search"
export { contentGroup } from "./content"
export { upstreamGroup } from "./upstream"
