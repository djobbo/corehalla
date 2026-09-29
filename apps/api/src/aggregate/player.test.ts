import { describe, expect, it } from "@effect/vitest"
import { clanMock } from "@crh/bhapi/mocks/clan"
import { playerRankedMock } from "@crh/bhapi/mocks/playerRanked"
import { playerStatsMock } from "@crh/bhapi/mocks/playerStats"
import { buildPlayer } from "./player"

/**
 * The player aggregate.
 *
 * It is pure — every network and database read is a parameter — so the rules
 * that decide what a profile says are testable without either. These pin the
 * things a reader would notice if they broke: that the totals add up, that a
 * weapon list contains only weapons actually held, that the current name is not
 * repeated as an alias, and that the two upstreams' vocabularies are translated
 * rather than passed through.
 */
const build = () =>
    buildPlayer(
        {
            stats: playerStatsMock,
            ranked: playerRankedMock,
            ranked3v3: null,
            aliases: ["Old Name", "djobbo.com", "old name", "  "],
            clan: clanMock,
        },
        1_700_000_000_000,
    )

describe("buildPlayer", () => {
    it("stamps the envelope with the age it was handed, not its own clock", () => {
        // The handler passes the *oldest* upstream read behind the payload;
        // taking `Date.now()` here instead would report the moment of assembly
        // and overstate how current the profile is.
        expect(build().meta.updated_at).toBe(1_700_000_000_000)
    })

    it("identifies the player with both an id and a canonical slug", () => {
        const { data } = build()

        expect(data.id).toBe(playerStatsMock.brawlhalla_id)
        expect(data.name).toBe(playerStatsMock.name)
        expect(data.slug.startsWith(`${playerStatsMock.brawlhalla_id}-`)).toBe(
            true,
        )
    })

    it("drops the current name and duplicates from the alias list", () => {
        const aliases = build().data.aliases

        expect(aliases).toEqual(["Old Name"])
    })

    it("sums the career figures across every legend", () => {
        const { data } = build()

        const matchtime = data.legends.reduce(
            (sum, legend) => sum + legend.stats.matchtime,
            0,
        )

        expect(data.stats.matchtime).toBe(matchtime)
        expect(data.stats.games).toBe(playerStatsMock.games)
        expect(data.stats.wins).toBe(playerStatsMock.wins)
    })

    it("keeps only weapons that have been held, most-held first", () => {
        const weapons = build().data.weapons

        expect(weapons.length).toBeGreaterThan(0)
        expect(weapons.every((weapon) => weapon.stats.games > 0)).toBe(true)

        for (let index = 1; index < weapons.length; index += 1) {
            expect(weapons[index - 1].stats.time_held).toBeGreaterThanOrEqual(
                weapons[index].stats.time_held,
            )
        }
    })

    it("derives thrown-item KOs so the KO sources sum to the total", () => {
        const { data } = build()

        const attributed =
            data.weapon_kos +
            data.unarmed.kos +
            data.gadgets.kos +
            data.stats.team_kos +
            data.thrown_kos

        expect(attributed).toBe(data.stats.kos)
        expect(data.thrown_kos).toBeGreaterThanOrEqual(0)
    })

    it("lowers the region into our own vocabulary", () => {
        const ranked = build().data.ranked

        expect(ranked?.["1v1"]?.region).toBe("us-e")
        // 3v3 was not supplied, so there is no 3v3 card — a payload existing is
        // not the same as a record.
        expect(ranked?.["3v3"]).toBeNull()
    })

    it("marks the solo-queue row in a 2v2 list", () => {
        const teams = build().data.ranked?.["2v2"]?.teams ?? []

        for (const team of teams) {
            expect(team.paired).toBe(team.team[1].id > 0)
        }
    })

    it("enriches the clan card from the roster read", () => {
        const clan = build().data.clan

        expect(clan?.id).toBe(playerStatsMock.clan?.clan_id)
        expect(clan?.xp).toBe(Number(playerStatsMock.clan?.clan_xp))
        expect(clan?.joined_at).not.toBeUndefined()
    })
})
