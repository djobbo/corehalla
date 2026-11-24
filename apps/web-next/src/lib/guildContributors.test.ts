import { describe, expect, it } from "@effect/vitest"
import {
    CONTRIBUTOR_LIMIT,
    contributorMetricLabel,
    topContributors,
} from "./guildContributors"
import type { GuildMember } from "@crh/api-contract/schemas"

describe("topContributors", () => {
    const member = (
        id: number,
        xp: number,
        guildPoints?: number,
    ): GuildMember => ({
        id,
        name: `Member ${id}`,
        slug: `${id}-member`,
        rank: "Member",
        joined_at: 1_700_000_000,
        xp,
        ...(guildPoints === undefined ? {} : { guild_points: guildPoints }),
    })

    it("orders by guild points when the payload reports them", () => {
        const { metric, members } = topContributors([
            member(1, 9_000, 120),
            member(2, 500, 4_200),
            member(3, 3_000, 800),
        ])

        expect(metric).toBe("guild_points")
        expect(members.map((entry) => entry.id)).toEqual([2, 3, 1])
    })

    it("leaves unreported points out of a points ranking", () => {
        const { members } = topContributors([
            member(1, 9_000),
            member(2, 500, 40),
        ])

        expect(members.map((entry) => entry.id)).toEqual([2])
    })

    it("falls back to XP, and says so, when no member reports points", () => {
        const { metric, members } = topContributors([
            member(1, 500),
            member(2, 9_000),
            member(3, 3_000),
        ])

        expect(metric).toBe("xp")
        expect(contributorMetricLabel(metric)).toBe("clan XP")
        expect(members.map((entry) => entry.id)).toEqual([2, 3, 1])
    })

    it("caps the list at five members", () => {
        const { members } = topContributors(
            Array.from({ length: 8 }, (_, index) =>
                member(index + 1, (index + 1) * 100),
            ),
        )

        expect(members).toHaveLength(CONTRIBUTOR_LIMIT)
        expect(members[0]?.id).toBe(8)
    })

    it("is empty for a guild with no members or no earned value", () => {
        expect(topContributors([])).toEqual({ metric: "xp", members: [] })
        expect(topContributors([member(1, 0)])).toEqual({
            metric: "xp",
            members: [],
        })
    })
})
