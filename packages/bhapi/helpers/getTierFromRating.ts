import { rankedTiers } from "../constants"

export const getTierFromRating = (rating: number) =>
    (rankedTiers.find((r) => rating >= r[1]) ||
        rankedTiers[rankedTiers.length - 1])[0]
