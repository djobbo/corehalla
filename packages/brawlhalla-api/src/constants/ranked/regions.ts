import { Schema, SchemaTransformation } from "effect"

export const rankedRegions = [
    "all",
    "us-e",
    "eu",
    "sea",
    "brz",
    "aus",
    "us-w",
    "jpn",
    "sa",
    "me",
] as const

const upperCaseRankedRegions = rankedRegions.map(
    (region) =>
        region.toUpperCase() as Uppercase<(typeof rankedRegions)[number]>,
)

export type RankedRegion = (typeof rankedRegions)[number]

/** Normalized region slug used in decoded API models. */
export const RankedRegionSchema = Schema.Literals(rankedRegions)

export const isRankedRegion = (value: string): value is RankedRegion =>
    (rankedRegions as readonly string[]).includes(value) ||
    upperCaseRankedRegions.includes(
        value as (typeof upperCaseRankedRegions)[number],
    )

/** Accepts lowercase or uppercase region slugs in route paths and query strings. */
export const RankedRegionParamSchema = Schema.String.pipe(
    Schema.decodeTo(
        RankedRegionSchema,
        SchemaTransformation.transform({
            decode: (input) => {
                const region = input.toLowerCase()
                return isRankedRegion(region) ? region : "all"
            },
            encode: (region) => region,
        }),
    ),
)
