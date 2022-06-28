import { rankedTiers } from "../constants"

export const getTierFromRating = (rating: number) =>
    (rankedTiers.find((r) => rating >= r[1]) ||
        rankedTiers[rankedTiers.length - 1])[0]

export const getMiniTierFromRating = (rating: number) => {
    const tier = getTierFromRating(rating)
    return tier[0] + (tier.split(" ")[1] ?? "")
}
