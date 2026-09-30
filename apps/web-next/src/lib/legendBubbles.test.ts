import { describe, expect, it } from "vite-plus/test"
import { toLegendBubbles } from "./legendBubbles"
import { legendIconSrc } from "./assets"
import { playerHref } from "./rankings"
import type { PlayerLegend } from "@crh/api-contract/schemas"

const legend = (
    id: number,
    name: string,
    overrides: Partial<PlayerLegend["stats"]> = {},
): PlayerLegend => ({
    id,
    name,
    name_key: name.toLowerCase(),
    slug: `${id}-${name.toLowerCase()}`,
    stats: {
        xp: 0,
        level: 7,
        xp_percentage: 0,
        damage_dealt: 0,
        damage_taken: 0,
        kos: 0,
        falls: 0,
        suicides: 0,
        team_kos: 0,
        matchtime: 0,
        games: 10,
        wins: 5,
        ...overrides,
    },
    weapon_one: { name: "Sword", damage_dealt: 0, kos: 0, time_held: 0 },
    weapon_two: { name: "Spear", damage_dealt: 0, kos: 0, time_held: 0 },
    unarmed: { damage_dealt: 0, kos: 0, time_held: 0 },
    gadgets: { damage_dealt: 0, kos: 0 },
    weapon_throws: { damage_dealt: 0, kos: 0 },
    ranked: null,
})

describe("toLegendBubbles", () => {
    it("drops legends with no recorded games", () => {
        const bubbles = toLegendBubbles([
            legend(3, "Bödvar"),
            legend(4, "Cassidy", { games: 0 }),
        ])

        expect(bubbles.map((bubble) => bubble.name)).toEqual(["Bödvar"])
    })

    it("uses each legend's own totals, not a per-weapon split", () => {
        const [bubble] = toLegendBubbles([
            legend(3, "Bödvar", {
                matchtime: 900,
                kos: 12,
                damage_dealt: 2700,
            }),
        ])

        expect(bubble.matchtime).toBe(900)
        expect(bubble.kos).toBe(12)
        expect(bubble.damage_dealt).toBe(2700)
        expect(bubble.games).toBe(10)
        expect(bubble.wins).toBe(5)
        expect(bubble.level).toBe(7)
    })

    it("carries the legend's id, art and page across", () => {
        const [bubble] = toLegendBubbles([legend(3, "Bödvar")])

        expect(bubble.key).toBe("3")
        expect(bubble.icon).toBe(legendIconSrc("bödvar"))
        expect(bubble.href).toBe(playerHref("3-bödvar"))
    })

    it("emits one bubble per legend however many weapons it wields", () => {
        const bubbles = toLegendBubbles([
            legend(3, "Bödvar"),
            legend(4, "Cassidy"),
            legend(5, "Orion"),
        ])

        expect(bubbles).toHaveLength(3)
        expect(new Set(bubbles.map((bubble) => bubble.key)).size).toBe(3)
    })

    it("orders by id so the server and client pack identically", () => {
        const bubbles = toLegendBubbles([
            legend(30, "Zariel"),
            legend(3, "Bödvar"),
            legend(12, "Scarlet"),
        ])

        expect(bubbles.map((bubble) => bubble.key)).toEqual(["3", "12", "30"])
    })

    it("does not reorder the caller's array", () => {
        const input = [legend(30, "Zariel"), legend(3, "Bödvar")]

        toLegendBubbles(input)

        expect(input.map((entry) => entry.id)).toEqual([30, 3])
    })

    it("returns an empty set when nothing has been played", () => {
        const bubbles = toLegendBubbles([
            legend(3, "Bödvar", { games: 0 }),
            legend(4, "Cassidy", { games: 0 }),
        ])

        expect(bubbles).toHaveLength(0)
    })
})
