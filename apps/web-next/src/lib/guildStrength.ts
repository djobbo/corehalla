import type { GuildMember } from "@crh/api-contract/schemas"

/** Every bucket covers one hundred rating points, lower edge included. */
export const RATING_BUCKET_WIDTH = 100

export type RatingBucket = {
    readonly from: number
    readonly to: number
    readonly count: number
}

export type GuildStrength = {
    readonly memberCount: number
    readonly ratedCount: number
    /** Members with no ranked record, not members rated at zero. */
    readonly unratedCount: number
    /** Mean of the rated ratings; null when no member has a ranked record. */
    readonly average: number | null
    /** Contiguous buckets from the lowest to the highest rated member. */
    readonly buckets: readonly RatingBucket[]
}

const bucketFloor = (rating: number): number =>
    Math.floor(rating / RATING_BUCKET_WIDTH) * RATING_BUCKET_WIDTH

export const guildStrength = (
    members: readonly GuildMember[],
): GuildStrength => {
    const ratings = members.flatMap((member) =>
        member.ranked === null ? [] : [member.ranked.rating],
    )

    const counts = new Map<number, number>()

    for (const rating of ratings) {
        const from = bucketFloor(rating)
        counts.set(from, (counts.get(from) ?? 0) + 1)
    }

    const buckets: RatingBucket[] = []

    if (ratings.length > 0) {
        const lowest = bucketFloor(Math.min(...ratings))
        const highest = bucketFloor(Math.max(...ratings))

        for (let from = lowest; from <= highest; from += RATING_BUCKET_WIDTH) {
            buckets.push({
                from,
                to: from + RATING_BUCKET_WIDTH - 1,
                count: counts.get(from) ?? 0,
            })
        }
    }

    return {
        memberCount: members.length,
        ratedCount: ratings.length,
        unratedCount: members.length - ratings.length,
        average:
            ratings.length === 0
                ? null
                : ratings.reduce((sum, rating) => sum + rating, 0) /
                  ratings.length,
        buckets,
    }
}

export type StrengthSummary = {
    /** The average to the nearest rating point, e.g. `2,612`. */
    readonly average: string
    /** The members it was drawn from, e.g. `across 3 of 4 members`. */
    readonly ratio: string
}

/** Null when no member is rated, so the panel has no average to show. */
export const strengthSummary = (
    strength: GuildStrength,
): StrengthSummary | null => {
    if (strength.average === null) return null

    const members = strength.memberCount === 1 ? "member" : "members"

    return {
        average: Math.round(strength.average).toLocaleString(),
        ratio: `across ${strength.ratedCount} of ${strength.memberCount} ${members}`,
    }
}

/** `1,800–1,899` — both edges, so the bucket cannot be mistaken for its floor. */
export const ratingRangeLabel = (bucket: RatingBucket): string =>
    `${bucket.from.toLocaleString()}–${bucket.to.toLocaleString()}`
