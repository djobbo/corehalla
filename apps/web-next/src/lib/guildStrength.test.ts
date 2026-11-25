import { describe, expect, it } from "@effect/vitest"
import {
    RATING_BUCKET_WIDTH,
    guildStrength,
    ratingRangeLabel,
    strengthSummary,
} from "./guildStrength"
import type { GuildMember } from "@crh/api-contract/schemas"

const member = (id: number, rating: number | null): GuildMember => ({
    id,
    name: `Member ${id}`,
    slug: `${id}-member`,
    rank: "Member",
    joined_at: 1_700_000_000,
    xp: 1_000,
    ranked:
        rating === null
            ? null
            : {
                  rating,
                  peak_rating: rating,
                  tier: "Diamond",
                  region: "eu",
              },
})

describe("guildStrength", () => {
    it("averages only the members with a ranked record", () => {
        const strength = guildStrength([
            member(1, 2_143),
            member(2, 1_876),
            member(3, 2_010),
            member(4, null),
        ])

        expect(strength.average).toBeCloseTo((2_143 + 1_876 + 2_010) / 3)
        expect(strength.ratedCount).toBe(3)
        expect(strength.unratedCount).toBe(1)
        expect(strength.memberCount).toBe(4)
    })

    it("has no average when no member is rated", () => {
        const strength = guildStrength([member(1, null), member(2, null)])

        expect(strength.average).toBeNull()
        expect(strength.ratedCount).toBe(0)
        expect(strength.unratedCount).toBe(2)
        expect(strength.buckets).toEqual([])
    })

    it("has nothing to report for an empty roster", () => {
        expect(guildStrength([])).toEqual({
            memberCount: 0,
            ratedCount: 0,
            unratedCount: 0,
            average: null,
            buckets: [],
        })
    })

    it("puts the lower edge of a bucket inside it", () => {
        const { buckets } = guildStrength([member(1, 1_800), member(2, 1_899)])

        expect(buckets).toEqual([{ from: 1_800, to: 1_899, count: 2 }])
    })

    it("steps a rating on the upper edge into the next bucket", () => {
        const { buckets } = guildStrength([member(1, 1_899), member(2, 1_900)])

        expect(buckets).toEqual([
            { from: 1_800, to: 1_899, count: 1 },
            { from: 1_900, to: 1_999, count: 1 },
        ])
    })

    it("keeps the empty buckets between the lowest and highest rated member", () => {
        const { buckets } = guildStrength([member(1, 1_805), member(2, 2_105)])

        expect(buckets).toHaveLength(4)
        expect(buckets[0]).toEqual({
            from: 1_800,
            to: 1_800 + RATING_BUCKET_WIDTH - 1,
            count: 1,
        })
        expect(buckets.slice(1, 3).map((bucket) => bucket.count)).toEqual([
            0, 0,
        ])
        expect(buckets[3]).toEqual({
            from: 2_100,
            to: 2_199,
            count: 1,
        })
    })

    it("reports a single rated member as one bucket and one member", () => {
        const strength = guildStrength([member(1, 1_940), member(2, null)])

        expect(strength.average).toBe(1_940)
        expect(strength.ratedCount).toBe(1)
        expect(strength.unratedCount).toBe(1)
        expect(strength.buckets).toEqual([{ from: 1_900, to: 1_999, count: 1 }])
    })
})

describe("strengthSummary", () => {
    it("states the average against the members it was drawn from", () => {
        const strength = guildStrength([
            member(1, 2_500),
            member(2, 2_600),
            member(3, 2_700),
            member(4, null),
        ])

        expect(strengthSummary(strength)).toEqual({
            average: "2,600",
            ratio: "across 3 of 4 members",
        })
    })

    it("reads as one member when the roster is one person", () => {
        const strength = guildStrength([member(1, 2_612)])

        expect(strengthSummary(strength)).toEqual({
            average: "2,612",
            ratio: "across 1 of 1 member",
        })
    })

    it("says nothing when no member is rated", () => {
        expect(strengthSummary(guildStrength([member(1, null)]))).toBeNull()
        expect(strengthSummary(guildStrength([]))).toBeNull()
    })
})

describe("ratingRangeLabel", () => {
    it("names both edges of the bucket", () => {
        expect(ratingRangeLabel({ from: 1_800, to: 1_899, count: 2 })).toBe(
            "1,800–1,899",
        )
    })
})
