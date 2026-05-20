export { BrawlhallaApi, BRAWLHALLA_API_BASE_URL } from "./api/definition.js"
export { BrawlhallaApiConfig } from "./api/config.js"
export {
    BrawlhallaApiClientService,
    layerBrawlhallaApiClient,
    makeBrawlhallaApiClient,
    type BrawlhallaApiClient,
} from "./api/client.js"
export { ApiKeyMiddleware } from "./api/middleware.js"

export {
    rankedBrackets,
    RankedBracketSchema,
    type RankedBracket,
} from "./constants/brackets.js"
export {
    clanRanks,
    ClanRankSchema,
    type ClanRank,
} from "./constants/clan-ranks.js"
export {
    rankedRegions,
    RankedRegionSchema,
    RankedRegionParamSchema,
    isRankedRegion,
    type RankedRegion,
} from "./constants/ranked/regions.js"
export {
    rankedTiers,
    RankedTierSchema,
    getTierFromRating,
    isRankedTier,
    type RankedTier,
} from "./constants/ranked/tiers.js"
export { weapons, type Weapon } from "./constants/weapons.js"

export * from "./schema/brawlhalla-id.js"
export * from "./schema/clan.js"
export * from "./schema/legends.js"
export * from "./schema/player-ranked.js"
export * from "./schema/player-stats.js"
export * from "./schema/rankings.js"
export * from "./schema/region.js"
export * from "./schema/search.js"
export * from "./schema/tier.js"
