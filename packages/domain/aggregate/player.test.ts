import { describe, expect, it } from "@effect/vitest"
import { clanMock } from "@crh/bhapi/mocks/clan"
import { playerRankedMock } from "@crh/bhapi/mocks/playerRanked"
import { playerStatsMock } from "@crh/bhapi/mocks/playerStats"
import { buildPlayer } from "./player"
import type { Player3v3Ranked } from "@crh/bhapi/types"
import type { PlayerSources } from "./player"

const build = (overrides: Partial<PlayerSources> = {}) =>
    buildPlayer(
        {
            stats: playerStatsMock,
            ranked: playerRankedMock,
            ranked3v3: null,
            aliases: ["Old Name", "djobbo.com", "old name", "  "],
            clan: clanMock,
            ...overrides,
        },
        1_700_000_000_000,
    )

const ranked3v3: Player3v3Ranked = {
    brawlhalla_id: 257670,
    name: "Moist | Boomie",
    rating: 1988,
    peak_rating: 2010,
    tier: "Diamond",
    wins: 60,
    games: 100,
    region: "US-E",
}

describe("buildPlayer", () => {
    it("stamps the envelope with the age it was handed, not its own clock", () => {
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
        expect(ranked?.["3v3"]).toBeNull()
    })

    it("carries the account's 1v1 ladder position", () => {
        const ranked = build({
            ranked: { ...playerRankedMock, global_rank: 41, region_rank: 1 },
        }).data.ranked

        expect(ranked?.["1v1"]).toMatchObject({
            global_rank: 41,
            region_rank: 1,
        })
    })

    it("treats a zero ladder position as absent", () => {
        const ranked = build().data.ranked

        expect(ranked?.["1v1"]).toMatchObject({
            global_rank: null,
            region_rank: null,
        })
    })

    it("leaves 3v3 without a ladder position", () => {
        const ranked = build({ ranked3v3 }).data.ranked

        expect(ranked?.["3v3"]).toMatchObject({
            rating: 1988,
            global_rank: null,
            region_rank: null,
        })
    })

    it("carries each 2v2 team's global position", () => {
        const teams = build({
            ranked: {
                ...playerRankedMock,
                "2v2": [
                    { ...playerRankedMock["2v2"][0]!, global_rank: 12 },
                    playerRankedMock["2v2"][1]!,
                ],
            },
        }).data.ranked?.["2v2"]?.teams

        expect(teams?.map((team) => team.global_rank)).toEqual([12, null])
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
        expect(clan?.xp).toBe(Number(clanMock.clan_xp))
        expect(clan?.joined_at).not.toBeUndefined()
    })
})
