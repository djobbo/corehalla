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
 *
 * The guild-points cases below are the opposite problem — a field v1 *does*
 * always send, on a type that permits its absence for the legacy upstream's
 * sake. Getting that direction wrong is silent: a dropped figure is invisible,
 * and an invented `0` looks like real data.
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
    guild_points: 0,
}

/**
 * A member of an *active* guild, where points and XP are both large and
 * unrelated to each other — 50k XP against 57k points here. The two are
 * different quantities, so the mapper must not be tempted to derive one from
 * the other.
 */
const contributor: V1GuildMember = {
    brawlhalla_id: 100140211,
    name: "muttso_YT",
    rank: "Member",
    join_date: 1784138601,
    xp: 50224,
    guild_points: 57454,
}

/**
 * One live snapshot of guild 9's own stats, kept separate from `guild` above so
 * that `xp` and `guild_points` come from the same read rather than being
 * stitched together from two.
 */
const guildWithPoints: V1Guild = {
    guild_id: 9,
    name: "3DT",
    create_date: 1464206400,
    xp: 389932,
    guild_points: 353054,
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

describe("toClan guild points", () => {
    it("carries a real points figure through untouched", () => {
        const clan = toClan(guild, [contributor])

        expect(clan.clan[0]?.guild_points).toBe(57454)
        // Not derived from `xp`: the two are separate totals and this member
        // leads on points while another leads on XP.
        expect(clan.clan[0]?.guild_points).not.toBe(contributor.xp)
    })

    /*
     * An inactive guild's whole roster is genuinely at zero, which is not the
     * same as v1 not reporting the field. Collapsing the second case into the
     * first would make every member of a dead guild look identical to a member
     * whose points could not be read.
     */
    it("keeps a real zero as a number rather than treating it as absent", () => {
        expect(toClan(guild, [named]).clan[0]?.guild_points).toBe(0)
    })

    it("defaults the field to 0 when v1 omits it", () => {
        // `Clan` allows the key to be absent because the legacy `/clan/:id`
        // payload has no such field, but v1 does send it — so the mapper's job
        // is to make the v1 path definite rather than to pass an absence on.
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
        /*
         * 57,454 against the clan's 353,054. A clan keeps the points of
         * everyone who has ever contributed, so the roster sum is a different
         * and smaller number — which is why this is read rather than derived,
         * and why the header must not present one as the other.
         */
        expect(clan.guild_points).not.toBe(roster)
    })

    it("leaves an unreported total absent rather than making it 0", () => {
        // Unlike a member's points, there is no defensible zero here: a
        // fabricated 0 would be printed as the claim that the clan has earned
        // nothing, when what happened is that the source did not say.
        expect(toClan(guild, [named]).guild_points).toBeUndefined()
    })
})
