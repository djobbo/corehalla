import { describe, expect, it } from "vitest"
import { toClan } from "./v1"
import type { V1Guild, V1GuildMember } from "./v1"

/**
 * `toClan` against the guild payload v1 actually returns.
 *
 * guild 9 does not always name its members: the same request returned all
 * nineteen with a `name`, and twice returned two of them with the key absent
 * entirely. `Clan.clan[].name` is declared `string`, so the mapper has to be the
 * place that decides what a missing name becomes — it is the boundary between
 * unvalidated upstream JSON and every consumer that is entitled to assume a
 * string.
 *
 * That assumption is what broke: the absence was passed straight through, and
 * the API's alias-building step called `.trim()` on it and answered 500.
 */

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
}

/** The shape observed live: id, rank, dates and xp, but no `name` key. */
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

        // Not `toBeUndefined()`: the whole bug was that the absence survived the
        // mapper and reached a consumer that had every right to call `.trim()`.
        expect(clan.clan[0]?.name).toBe("")
    })

    it("keeps the member rather than dropping it", () => {
        const clan = toClan(guild, [named, unnamed])

        // The member is real: the id resolves to a profile and the row carries a
        // rank, a join date and an XP contribution. Dropping it would understate
        // the roster, so the missing field is the only thing lost.
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
