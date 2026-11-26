import { describe, expect, it } from "@effect/vitest"
import { LANDING_GUILDS_LIMIT, landingGuilds } from "./landingGuilds"
import type { ClanRanking } from "@crh/api-contract/schemas"

const clan = (
    position: number,
    over: Partial<ClanRanking> = {},
): ClanRanking => ({
    id: String(position),
    name: `Guild ${position}`,
    slug: `guild-${position}`,
    nameLower: `guild ${position}`,
    created: 1_500_000_000,
    xp: 10_000_000 - position * 1_000,
    ...over,
})

const board = (count: number): readonly ClanRanking[] =>
    Array.from({ length: count }, (_, index) => clan(index + 1))

describe("landingGuilds", () => {
    it("returns nothing when the board is absent", () => {
        expect(landingGuilds(null)).toEqual([])
    })

    it("returns nothing for an empty board", () => {
        expect(landingGuilds([])).toEqual([])
    })

    it("takes the first five rows in board order, ranked from one", () => {
        const guilds = landingGuilds(board(8))

        expect(guilds).toHaveLength(LANDING_GUILDS_LIMIT)
        expect(guilds.map(({ rank }) => rank)).toEqual([1, 2, 3, 4, 5])
        expect(guilds.map(({ name }) => name)).toEqual([
            "Guild 1",
            "Guild 2",
            "Guild 3",
            "Guild 4",
            "Guild 5",
        ])
    })

    it("formats XP the way the rest of the site does", () => {
        const [guild] = landingGuilds([clan(1, { xp: 12_345_678 })])

        expect(guild?.xp).toBe("12,345,678")
    })

    it("tolerates a board shorter than five", () => {
        const guilds = landingGuilds(board(3))

        expect(guilds.map(({ rank }) => rank)).toEqual([1, 2, 3])
    })

    it("links each row to its guild profile and carries its id", () => {
        const [guild] = landingGuilds([
            clan(1, { id: "abc", slug: "iron-legion" }),
        ])

        expect(guild?.id).toBe("abc")
        expect(guild?.href).toBe("/stats/guilds/iron-legion")
    })

    it("decodes a guild name the archive stored as latin-1 bytes", () => {
        const [guild] = landingGuilds([clan(1, { name: "BÃ¶dvar" })])

        expect(guild?.name).toBe("Bödvar")
    })
})
