import { Schema, SchemaTransformation } from "effect"

import { RankedTierSchema, isRankedTier } from "../constants/ranked/tiers.js"

/**
 * The API returns `null` for Valhallan tier and sometimes `none` when unranked.
 */
export const BrawlhallaApiTier = Schema.NullOr(Schema.String).pipe(
    Schema.decodeTo(
        Schema.NullOr(RankedTierSchema),
        SchemaTransformation.transform({
            decode: (input) => {
                if (input === null) {
                    return "Valhallan"
                }

                if (input === "none") {
                    return null
                }

                if (!isRankedTier(input)) {
                    return null
                }

                return input
            },
            encode: (tier) => tier,
        }),
    ),
)

export type BrawlhallaApiTier = typeof BrawlhallaApiTier.Type
