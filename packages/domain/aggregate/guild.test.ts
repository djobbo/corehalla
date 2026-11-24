import { describe, expect, it } from "@effect/vitest"
import { clanMock } from "@crh/bhapi/mocks/clan"
import { buildGuild } from "./guild"
import type { GuildMemberRating } from "./guild"

const UNRANKED = { rank: null, total: 0 }

const REEDMAN = 51859169
const BOOMIE = 257670

const reedmanRating: GuildMemberRating = {
    playerId: REEDMAN.toString(),
    rating: 2143,
    peakRating: 2210,
    tier: "Diamond",
    region: "eu",
}

describe("buildGuild", () => {
    it("derives the level and progress from the clan's XP", () => {
        const { data } = buildGuild(clanMock, 1_700_000_000_000, UNRANKED, [])

        expect(data.id).toBe(clanMock.clan_id)
        expect(data.xp).toBe(Number(clanMock.clan_xp))
        expect(data.level).toBeGreaterThanOrEqual(1)
        expect(data.xp_percentage).toBeGreaterThanOrEqual(0)
        expect(data.xp_percentage).toBeLessThanOrEqual(100)
        expect(data.slug.startsWith(`${clanMock.clan_id}-`)).toBe(true)
    })

    it("carries every member with an id, a name and a slug", () => {
        const { data } = buildGuild(clanMock, 1, UNRANKED, [])

        expect(data.members).toHaveLength(clanMock.clan.length)

        for (const member of data.members) {
            expect(member.slug.startsWith(`${member.id}-`)).toBe(true)
        }
    })

    it("does not invent a guild-points total the source did not send", () => {
        // Null, not a roster sum of zero, when the source omitted points.
        const { data } = buildGuild(clanMock, 1, UNRANKED, [])

        if (clanMock.guild_points === undefined) {
            expect(data.guild_points).toBeNull()
        }
        if (clanMock.legacy_xp === undefined) {
            expect(data.lifetime_xp).toBeNull()
        }
    })

    it("carries the archive standing untouched", () => {
        const { data } = buildGuild(clanMock, 1, { rank: 12, total: 4_509 }, [])

        expect(data.standing).toEqual({ rank: 12, total: 4_509 })
    })

    it("keeps an unranked guild unranked rather than guessing a place", () => {
        const { data } = buildGuild(clanMock, 1, { rank: null, total: 900 }, [])

        expect(data.standing.rank).toBeNull()
        expect(data.standing.total).toBe(900)
    })

    it("attaches an archive rating to the member it belongs to", () => {
        const { data } = buildGuild(clanMock, 1, UNRANKED, [reedmanRating])

        const reedman = data.members.find((member) => member.id === REEDMAN)

        expect(reedman?.ranked).toEqual({
            rating: 2_143,
            peak_rating: 2_210,
            tier: "Diamond",
            region: "eu",
        })
        expect(
            data.members.filter((member) => member.ranked !== null),
        ).toHaveLength(1)
    })

    it("leaves a member the archive does not know null", () => {
        const { data } = buildGuild(clanMock, 1, UNRANKED, [reedmanRating])

        const boomie = data.members.find((member) => member.id === BOOMIE)

        expect(boomie?.ranked).toBeNull()
    })

    it("does not turn an indexed but unranked account into a zero rating", () => {
        const { data } = buildGuild(clanMock, 1, UNRANKED, [
            {
                playerId: REEDMAN.toString(),
                rating: 0,
                peakRating: 0,
                tier: "",
                region: "",
            },
        ])

        const reedman = data.members.find((member) => member.id === REEDMAN)

        expect(reedman?.ranked).toBeNull()
    })

    it("leaves the whole roster null when no rating was read", () => {
        const { data } = buildGuild(clanMock, 1, UNRANKED, [])

        expect(data.members.every((member) => member.ranked === null)).toBe(
            true,
        )
    })
})
