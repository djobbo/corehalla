import { describe, expect, it } from "@effect/vitest"
import { weapons } from "@crh/bhapi/constants"
import { legends } from "@crh/bhapi/legends"
import {
    legendsWithWeapon,
    resolveWeaponSlug,
    weaponCareerHref,
    weaponHref,
    weaponSlug,
} from "./weapons"

describe("weaponSlug", () => {
    it("kebab-cases a multi-word weapon", () => {
        expect(weaponSlug("Grapple Hammer")).toBe("grapple-hammer")
        expect(weaponSlug("Battle Boots")).toBe("battle-boots")
        expect(weaponSlug("Rocket Lance")).toBe("rocket-lance")
    })

    it("keeps a single-word weapon as-is", () => {
        expect(weaponSlug("Sword")).toBe("sword")
        expect(weaponSlug("Greatsword")).toBe("greatsword")
    })
})

describe("resolveWeaponSlug", () => {
    it("round-trips every weapon slug → weapon → slug", () => {
        for (const weapon of weapons) {
            expect(resolveWeaponSlug(weaponSlug(weapon))).toBe(weapon)
        }
    })

    it("resolves an encoded display name", () => {
        expect(resolveWeaponSlug("Grapple%20Hammer")).toBe("Grapple Hammer")
        expect(resolveWeaponSlug("Battle%20Boots")).toBe("Battle Boots")
    })

    it("resolves any spelling of the same weapon", () => {
        expect(resolveWeaponSlug("SWORD")).toBe("Sword")
        expect(resolveWeaponSlug("Sword")).toBe("Sword")
        expect(resolveWeaponSlug("grapple hammer")).toBe("Grapple Hammer")
    })

    it("returns null for an unknown slug", () => {
        expect(resolveWeaponSlug("laser-sword")).toBeNull()
        expect(resolveWeaponSlug("")).toBeNull()
    })
})

describe("weaponHref", () => {
    it("points at the weapon page", () => {
        expect(weaponHref("Sword")).toBe("/weapons/sword")
        expect(weaponHref("Battle Boots")).toBe("/weapons/battle-boots")
    })
})

describe("weaponCareerHref", () => {
    it("keeps the display name and the sort", () => {
        expect(weaponCareerHref("Grapple Hammer", "wins")).toBe(
            "/rankings/career/weapons/Grapple%20Hammer?sortBy=wins",
        )
    })
})

describe("legendsWithWeapon", () => {
    it("lists every legend that wields the weapon, in roster order", () => {
        const wielders = legendsWithWeapon("Grapple Hammer")
        const expected = legends.filter(
            (legend) =>
                legend.weapon_one === "Grapple Hammer" ||
                legend.weapon_two === "Grapple Hammer",
        )

        expect(wielders).toEqual(expected)
        expect(wielders).toContainEqual(
            expect.objectContaining({ bio_name: "Bödvar" }),
        )
    })

    it("covers every weapon in the roster", () => {
        for (const weapon of weapons) {
            expect(legendsWithWeapon(weapon).length).toBeGreaterThan(0)
        }
    })
})
