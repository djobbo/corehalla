import { Schema } from "effect"

export const rankedTiers = [
    "Valhallan",
    "Diamond",
    "Platinum 5",
    "Platinum 4",
    "Platinum 3",
    "Platinum 2",
    "Platinum 1",
    "Gold 5",
    "Gold 4",
    "Gold 3",
    "Gold 2",
    "Gold 1",
    "Silver 5",
    "Silver 4",
    "Silver 3",
    "Silver 2",
    "Silver 1",
    "Bronze 5",
    "Bronze 4",
    "Bronze 3",
    "Bronze 2",
    "Bronze 1",
    "Tin 5",
    "Tin 4",
    "Tin 3",
    "Tin 2",
    "Tin 1",
    "Tin 0",
] as const

export type RankedTier = (typeof rankedTiers)[number]

export const RankedTierSchema = Schema.Literals(rankedTiers)

const rankedTierByRating = {
    Valhallan: 9999,
    Diamond: 2000,
    "Platinum 5": 1936,
    "Platinum 4": 1872,
    "Platinum 3": 1808,
    "Platinum 2": 1744,
    "Platinum 1": 1680,
    "Gold 5": 1622,
    "Gold 4": 1564,
    "Gold 3": 1506,
    "Gold 2": 1448,
    "Gold 1": 1390,
    "Silver 5": 1338,
    "Silver 4": 1286,
    "Silver 3": 1234,
    "Silver 2": 1182,
    "Silver 1": 1130,
    "Bronze 5": 1086,
    "Bronze 4": 1042,
    "Bronze 3": 998,
    "Bronze 2": 954,
    "Bronze 1": 910,
    "Tin 5": 872,
    "Tin 4": 834,
    "Tin 3": 796,
    "Tin 2": 758,
    "Tin 1": 720,
    "Tin 0": 200,
} as const satisfies Record<RankedTier, number>

export const isRankedTier = (value: string): value is RankedTier =>
    (rankedTiers as readonly string[]).includes(value)

export const getTierFromRating = (rating: number): RankedTier => {
    for (const [tier, threshold] of Object.entries(rankedTierByRating)) {
        if (rating >= threshold) {
            return tier as RankedTier
        }
    }

    return "Tin 0"
}
