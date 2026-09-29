import { describe, expect, it } from "vitest"
import { toClan } from "./v1"
import type { V1Guild, V1GuildMember } from "./v1"

const guild: V1Guild = {
    guild_id: 9,
    name: "3DT",
    create_date: 1464206400,
    xp: 386286,
}

const named: V1GuildMember = {
    brawlhalla_id: 114528,
    name: "Chubby Burger",
    rank: "Member",
    join_date: 1470616232,
    xp: 96784,
    guild_points: 0,
}

const contributor: V1GuildMember = {
    brawlhalla_id: 100140211,
    name: "muttso_YT",
    rank: "Member",
    join_date: 1784138601,
    xp: 50224,
    guild_points: 57454,
}

const guildWithPoints: V1Guild = {
    guild_id: 9,
    name: "3DT",
    create_date: 1464206400,
    xp: 389932,
    guild_points: 353054,
}

const unnamed: V1GuildMember = {
    brawlhalla_id: 10154596,
    rank: "Member",
    join_date: 1629855043,
    xp: 32987,
}

describe("toClan", () => {
    it("carries the guild's own fields through", () => {
        const clan = toClan(guild, [])

        expect(clan).toMatchObject({
            clan_id: 9,
            clan_name: "3DT",
            clan_create_date: 1464206400,
            clan_xp: "386286",
        })
    })

    it("maps a member with no name to '', never undefined", () => {
        const clan = toClan(guild, [unnamed])

        expect(clan.clan[0]?.name).toBe("")
    })

    it("keeps the member rather than dropping it", () => {
        const clan = toClan(guild, [named, unnamed])

        expect(clan.clan).toHaveLength(2)
        expect(clan.clan[1]).toMatchObject({
            brawlhalla_id: 10154596,
            rank: "Member",
            join_date: 1629855043,
            xp: 32987,
        })
    })

    it("still names the members v1 did name", () => {
        expect(toClan(guild, [named]).clan[0]?.name).toBe("Chubby Burger")
    })
})

describe("toClan guild points", () => {
    it("carries a real points figure through untouched", () => {
        const clan = toClan(guild, [contributor])

        expect(clan.clan[0]?.guild_points).toBe(57454)
        expect(clan.clan[0]?.guild_points).not.toBe(contributor.xp)
    })

    it("keeps a real zero as a number rather than treating it as absent", () => {
        expect(toClan(guild, [named]).clan[0]?.guild_points).toBe(0)
    })

    it("defaults the field to 0 when v1 omits it", () => {
        const { guild_points: _omitted, ...withoutPoints } = named

        expect(toClan(guild, [withoutPoints]).clan[0]?.guild_points).toBe(0)
    })
})

describe("toClan clan-level guild points", () => {
    it("carries the clan's own total, which its roster does not add up to", () => {
        const clan = toClan(guildWithPoints, [contributor, named])

        const roster = [contributor, named].reduce(
            (sum, member) => sum + (member.guild_points ?? 0),
            0,
        )

        expect(clan.guild_points).toBe(353054)

        expect(clan.guild_points).not.toBe(roster)
    })

    it("leaves an unreported total absent rather than making it 0", () => {
        expect(toClan(guild, [named]).guild_points).toBeUndefined()
    })
})
