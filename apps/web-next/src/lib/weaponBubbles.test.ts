import { describe, expect, it } from "vite-plus/test"
import { toWeaponBubbles } from "./weaponBubbles"
import { weaponIconSrc } from "./assets"
import type { Player, PlayerWeapon } from "@crh/api-contract/schemas"

const noUnarmed: Player["unarmed"] = {
    damage_dealt: 0,
    kos: 0,
    time_held: 0,
}

const weapon = (
    name: string,
    overrides: Partial<PlayerWeapon["stats"]> = {},
): PlayerWeapon => ({
    name,
    stats: {
        games: 10,
        wins: 5,
        kos: 12,
        damage_dealt: 2700,
        time_held: 900,
        level: 7,
        xp: 1000,
        ...overrides,
    },
    legends: [],
})

describe("toWeaponBubbles", () => {
    it("drops weapons with no recorded games", () => {
        const bubbles = toWeaponBubbles(
            [weapon("Sword"), weapon("Bow", { games: 0 })],
            noUnarmed,
        )

        expect(bubbles.map((bubble) => bubble.name)).toEqual(["Sword"])
    })

    it("uses time held as the playtime metric", () => {
        const [bubble] = toWeaponBubbles([weapon("Sword")], noUnarmed)

        expect(bubble.matchtime).toBe(900)
        expect(bubble.kos).toBe(12)
        expect(bubble.damage_dealt).toBe(2700)
        expect(bubble.games).toBe(10)
        expect(bubble.wins).toBe(5)
        expect(bubble.level).toBe(7)
    })

    it("carries the weapon name as its key and its icon across", () => {
        const [bubble] = toWeaponBubbles([weapon("Battle Boots")], noUnarmed)

        expect(bubble.key).toBe("Battle Boots")
        expect(bubble.icon).toBe(weaponIconSrc("Battle Boots"))
    })

    it("links nowhere: weapons have no page of their own", () => {
        const [bubble] = toWeaponBubbles([weapon("Sword")], noUnarmed)

        expect(bubble.href).toBeUndefined()
    })

    it("orders by name so the server and client pack identically", () => {
        const bubbles = toWeaponBubbles(
            [weapon("Sword"), weapon("Axe"), weapon("Katars")],
            noUnarmed,
        )

        expect(bubbles.map((bubble) => bubble.name)).toEqual([
            "Axe",
            "Katars",
            "Sword",
        ])
    })

    it("does not reorder the caller's array", () => {
        const input = [weapon("Sword"), weapon("Axe")]

        toWeaponBubbles(input, noUnarmed)

        expect(input.map((entry) => entry.name)).toEqual(["Sword", "Axe"])
    })

    it("returns an empty set when nothing was wielded or held", () => {
        const bubbles = toWeaponBubbles(
            [weapon("Sword", { games: 0 }), weapon("Bow", { games: 0 })],
            noUnarmed,
        )

        expect(bubbles).toHaveLength(0)
    })

    it("adds unarmed from its own totals, with no level or record", () => {
        const bubbles = toWeaponBubbles([weapon("Sword")], {
            damage_dealt: 500,
            kos: 3,
            time_held: 120,
        })

        const unarmed = bubbles.find((bubble) => bubble.key === "Unarmed")

        expect(unarmed?.icon).toBe(weaponIconSrc("Unarmed"))
        expect(unarmed?.matchtime).toBe(120)
        expect(unarmed?.kos).toBe(3)
        expect(unarmed?.damage_dealt).toBe(500)
        expect(unarmed?.level).toBeUndefined()
        expect(unarmed?.games).toBeUndefined()
        expect(unarmed?.wins).toBeUndefined()
    })

    it("orders unarmed among the weapons by name", () => {
        const bubbles = toWeaponBubbles([weapon("Sword"), weapon("Axe")], {
            damage_dealt: 0,
            kos: 0,
            time_held: 1,
        })

        expect(bubbles.map((bubble) => bubble.key)).toEqual([
            "Axe",
            "Sword",
            "Unarmed",
        ])
    })

    it("omits unarmed when no time was spent unarmed", () => {
        const bubbles = toWeaponBubbles([weapon("Sword")], noUnarmed)

        expect(bubbles.some((bubble) => bubble.key === "Unarmed")).toBe(false)
    })
})
