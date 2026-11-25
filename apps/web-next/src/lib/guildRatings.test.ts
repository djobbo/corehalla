import { describe, expect, it } from "@effect/vitest"
import { compareMemberRating } from "./guildRatings"
import type { GuildMember } from "@crh/api-contract/schemas"

const member = (id: number, rating: number | null): GuildMember => ({
    id,
    name: `Member ${id}`,
    slug: `${id}-member`,
    rank: "Member",
    joined_at: 1_700_000_000,
    xp: 0,
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

const ids = (members: readonly GuildMember[]): readonly number[] =>
    members.map((entry) => entry.id)

describe("compareMemberRating", () => {
    it("orders members by their 1v1 rating", () => {
        const sorted = [
            member(1, 1_800),
            member(2, 2_100),
            member(3, 1_990),
        ].sort(compareMemberRating)

        expect(ids(sorted)).toEqual([1, 3, 2])
    })

    it("groups members outside the index below the rated ones", () => {
        const sorted = [
            member(1, null),
            member(2, 2_100),
            member(3, null),
            member(4, 1_800),
        ].sort(compareMemberRating)

        // No rating sits below every rating, so the group holds together.
        expect(ids(sorted)).toEqual([1, 3, 4, 2])
    })

    it("keeps the incoming order when nobody is rated", () => {
        const sorted = [member(3, null), member(1, null), member(2, null)].sort(
            compareMemberRating,
        )

        expect(ids(sorted)).toEqual([3, 1, 2])
    })

    it("keeps the incoming order for members on the same rating", () => {
        const sorted = [
            member(2, 2_000),
            member(3, 2_000),
            member(1, 2_000),
        ].sort(compareMemberRating)

        expect(ids(sorted)).toEqual([2, 3, 1])
    })
})
