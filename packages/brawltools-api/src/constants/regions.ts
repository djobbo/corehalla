import { Schema, SchemaTransformation } from "effect"

export const powerRankingsRegions = [
    "NA",
    "EU",
    "SA",
    "SEA",
    "MENA",
    "LAN",
] as const

const lowerCasePowerRankingsRegions = powerRankingsRegions.map(
    (region) =>
        region.toLowerCase() as Lowercase<
            (typeof powerRankingsRegions)[number]
        >,
)

export type PowerRankingsRegion = (typeof powerRankingsRegions)[number]

export const PowerRankingsRegionSchema = Schema.Literals(powerRankingsRegions)

export const isPowerRankingsRegion = (
    value: string,
): value is PowerRankingsRegion =>
    (powerRankingsRegions as readonly string[]).includes(value) ||
    lowerCasePowerRankingsRegions.includes(
        value as (typeof lowerCasePowerRankingsRegions)[number],
    )

/** Accepts uppercase or lowercase region codes in query params. */
export const PowerRankingsRegionParamSchema = Schema.String.pipe(
    Schema.decodeTo(
        PowerRankingsRegionSchema,
        SchemaTransformation.transform({
            decode: (input) => {
                const region = input.toUpperCase()
                return isPowerRankingsRegion(region) ? region : "NA"
            },
            encode: (region) => region,
        }),
    ),
)
