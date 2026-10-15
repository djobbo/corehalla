import { rankedRegionSchema } from "./routeSchemas"
import type { RankedRegion } from "./routeSchemas"

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
