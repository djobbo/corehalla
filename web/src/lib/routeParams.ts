import {
    powerRankingsBracketSchema,
    powerRankingsRegionSchema,
    rankedRegionSchema,
} from "./schemas"
import type { RankedRegion } from "./schemas"
import type {
    PowerRankingsBracket,
    PowerRankingsRegion,
} from "web-parser/power-rankings/parsePowerRankingsPage"

/**
 * Path-parameter resolvers.
 *
 * The previous pages-router code parsed optional catch-all segments and, in
 * some pages, silently fell back to defaults. These helpers do the same
 * validation while keeping the fallback behaviour consistent across the
 * rankings routes, so an invalid path segment renders the default view instead
 * of failing the server function.
 */

export const resolveRankedRegion = (region?: string): RankedRegion =>
    region && rankedRegionSchema.safeParse(region).success
        ? (region as RankedRegion)
        : "all"

export const resolvePage = (page?: string): string =>
    page && /^[0-9]+$/.test(page) ? page : "1"

export const resolvePowerRankingsBracket = (
    bracket?: string,
): PowerRankingsBracket =>
    bracket && powerRankingsBracketSchema.safeParse(bracket).success
        ? (bracket as PowerRankingsBracket)
        : "1v1"

export const resolvePowerRankingsRegion = (
    region?: string,
): PowerRankingsRegion =>
    region && powerRankingsRegionSchema.safeParse(region).success
        ? (region as PowerRankingsRegion)
        : "us-e"
