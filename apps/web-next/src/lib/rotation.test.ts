import { describe, expect, it } from "vite-plus/test"
import { rotationSlots } from "./rotation"
import type { RotationLegend } from "./rotation"

const legend = (index: number): RotationLegend => ({
    legend_id: index,
    legend_name_key: `legend-${index}`,
    bio_name: `Legend ${index}`,
    bio_aka: "",
    weapon_one: "Sword",
    weapon_two: "Spear",
    strength: "6",
    dexterity: "5",
    defense: "6",
    speed: "5",
})

const legends = (count: number): readonly RotationLegend[] =>
    Array.from({ length: count }, (_, index) => legend(index + 1))

describe("rotationSlots", () => {
    it("passes nine legends through in order", () => {
        expect(rotationSlots(legends(9))).toEqual(legends(9))
    })

    it("pads a short rotation with empty slots in the tail", () => {
        const slots = rotationSlots(legends(8))

        expect(slots.slice(0, 8)).toEqual(legends(8))
        expect(slots[8]).toBeNull()
    })

    it("truncates a long rotation to nine", () => {
        expect(rotationSlots(legends(10))).toEqual(legends(9))
    })

    it("yields nine empty slots for an empty rotation", () => {
        expect(rotationSlots([])).toEqual(Array.from({ length: 9 }, () => null))
    })

    it("always returns nine slots", () => {
        expect(rotationSlots(legends(3))).toHaveLength(9)
    })
})
