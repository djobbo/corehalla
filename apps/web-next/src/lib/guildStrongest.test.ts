import { describe, expect, it } from "@effect/vitest"
import { STRONGEST_MEMBER_LIMIT, strongestMembers } from "./guildStrongest"
import type { GuildMember } from "@crh/api-contract/schemas"

type MemberOptions = {
    readonly name?: string
    readonly rating?: number | null
    readonly peak?: number
    readonly tier?: string | null
    readonly region?: string | null
}

const member = (id: number, options: MemberOptions = {}): GuildMember => {
    const rating = options.rating === undefined ? 2_000 : options.rating

    return {
        id,
        name: options.name ?? `Member ${id}`,
        slug: `${id}-member`,
        rank: "Member",
        joined_at: 1_700_000_000,
        xp: 0,
        ranked:
            rating === null
                ? null
                : {
                      rating,
                      peak_rating: options.peak ?? rating,
                      tier:
                          options.tier === undefined ? "Diamond" : options.tier,
                      region:
                          options.region === undefined ? "eu" : options.region,
                  },
    }
}

const ids = (members: readonly GuildMember[]): readonly number[] =>
    strongestMembers(members).map((entry) => entry.id)

describe("strongestMembers", () => {
    it("keeps the five highest ratings, highest first", () => {
        const roster = [
            member(1, { rating: 1_400 }),
            member(2, { rating: 2_500 }),
            member(3, { rating: 1_800 }),
            member(4, { rating: 2_200 }),
            member(5, { rating: 1_600 }),
            member(6, { rating: 2_000 }),
        ]

        expect(STRONGEST_MEMBER_LIMIT).toBe(5)
        expect(ids(roster)).toEqual([2, 4, 6, 3, 5])
    })

    it("breaks equal ratings by name, then id, whatever the input order", () => {
        const zed = member(3, { rating: 2_000, name: "Zed" })
        const adaFive = member(5, { rating: 2_000, name: "Ada" })
        const adaTwo = member(2, { rating: 2_000, name: "Ada" })

        expect(ids([zed, adaFive, adaTwo])).toEqual([2, 5, 3])
        expect(ids([adaTwo, zed, adaFive])).toEqual([2, 5, 3])
        expect(ids([adaFive, adaTwo, zed])).toEqual([2, 5, 3])
    })

    it("leaves unrated members out rather than ranking them below the rated", () => {
        const roster = [
            member(1, { rating: null }),
            member(2, { rating: 1_900 }),
            member(3, { rating: null }),
            member(4, { rating: 2_100 }),
            member(5, { rating: null }),
        ]

        expect(ids(roster)).toEqual([4, 2])
    })

    it("lists exactly the rated members when fewer than five remain", () => {
        const roster = [
            member(1, { rating: 1_500 }),
            member(2, { rating: null }),
            member(3, { rating: 1_700 }),
        ]

        expect(ids(roster)).toEqual([3, 1])
    })

    it("returns an empty list when no member is rated", () => {
        const roster = [
            member(1, { rating: null }),
            member(2, { rating: null }),
        ]

        expect(strongestMembers(roster)).toEqual([])
    })

    it("reads a null tier as Valhallan", () => {
        const [top] = strongestMembers([member(1, { tier: null })])

        expect(top?.tier).toBe("Valhallan")
    })

    it("carries the record a row shows", () => {
        const [top] = strongestMembers([
            member(1, {
                rating: 2_311,
                peak: 2_404,
                tier: "Platinum 3",
                region: "us-e",
            }),
        ])

        expect(top).toMatchObject({
            rating: 2_311,
            peakRating: 2_404,
            tier: "Platinum 3",
            region: "us-e",
        })
    })

    it("honours a larger limit", () => {
        const roster = Array.from({ length: 7 }, (_, index) =>
            member(index + 1, { rating: 1_000 + index * 100 }),
        )

        expect(ids(roster)).toHaveLength(STRONGEST_MEMBER_LIMIT)
        expect(strongestMembers(roster, 7)).toHaveLength(7)
    })
})
