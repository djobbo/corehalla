import { Schema, SchemaTransformation } from "effect"

import {
    RankedRegionSchema,
    isRankedRegion,
    rankedRegions,
} from "../constants/ranked/regions.js"

/**
 * The API can return a region slug, `none`, or a numeric index into an
 * arbitrary region list.
 */
export const BrawlhallaApiRegion = Schema.NullOr(
    Schema.Union([Schema.String, Schema.Number]),
).pipe(
    Schema.decodeTo(
        Schema.NullOr(RankedRegionSchema),
        SchemaTransformation.transform({
            decode: (input) => {
                if (input === null) {
                    return null
                }

                if (input === "none") {
                    return null
                }

                const region =
                    typeof input === "number"
                        ? rankedRegions[input - 1]
                        : input.toLowerCase()

                if (!region || !isRankedRegion(region)) {
                    return null
                }

                return region
            },
            encode: (region) => (region === null ? "none" : region),
        }),
    ),
)

export type BrawlhallaApiRegion = typeof BrawlhallaApiRegion.Type
