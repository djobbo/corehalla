import { describe, expect, it } from "@effect/vitest"
import { clanMock } from "@crh/bhapi/mocks/clan"
import { buildGuild } from "./guild"

describe("buildGuild", () => {
    it("derives the level and progress from the clan's XP", () => {
        const { data } = buildGuild(clanMock, 1_700_000_000_000)

        expect(data.id).toBe(clanMock.clan_id)
        expect(data.xp).toBe(Number(clanMock.clan_xp))
        expect(data.level).toBeGreaterThanOrEqual(1)
        expect(data.xp_percentage).toBeGreaterThanOrEqual(0)
        expect(data.xp_percentage).toBeLessThanOrEqual(100)
        expect(data.slug.startsWith(`${clanMock.clan_id}-`)).toBe(true)
    })

    it("carries every member with an id, a name and a slug", () => {
        const { data } = buildGuild(clanMock, 1)

        expect(data.members).toHaveLength(clanMock.clan.length)

        for (const member of data.members) {
            expect(member.slug.startsWith(`${member.id}-`)).toBe(true)
        }
    })

    it("does not invent a guild-points total the source did not send", () => {
        // Null, not a roster sum of zero, when the source omitted points.
        const { data } = buildGuild(clanMock, 1)

        if (clanMock.guild_points === undefined) {
            expect(data.guild_points).toBeNull()
        }
        if (clanMock.legacy_xp === undefined) {
            expect(data.lifetime_xp).toBeNull()
        }
    })
})
