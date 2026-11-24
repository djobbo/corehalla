import { describe, expect, it } from "@effect/vitest"
import type { WeaponMetaRow } from "./weaponMeta"
import {
    formatWeaponMetaCount,
    formatWeaponMetaDuration,
    formatWeaponMetaRate,
    weaponMetaRankLabel,
    weaponMetaSample,
    weaponPlayShareRank,
} from "./weaponMeta"

const row = (
    weapon: WeaponMetaRow["weapon"],
    over: Partial<WeaponMetaRow> = {},
): WeaponMetaRow => ({
    weapon,
    games: 100,
    wins: 50,
    winRate: 0.5,
    playShare: 0.25,
    accounts: 10,
    damagePerGame: 300,
    timeHeldPerGame: 90,
    kosPerGame: 0.9,
    ...over,
})

describe("formatWeaponMetaRate", () => {
    it("renders a fraction as a percentage", () => {
        expect(formatWeaponMetaRate(0.1234)).toBe("12.34%")
        expect(formatWeaponMetaRate(0.5)).toBe("50%")
        expect(formatWeaponMetaRate(1)).toBe("100%")
    })

    it("drops trailing zeros instead of padding them", () => {
        expect(formatWeaponMetaRate(0.06)).toBe("6%")
        expect(formatWeaponMetaRate(0.0667)).toBe("6.67%")
    })

    it("renders an empty denominator as a dash, not a fabricated zero", () => {
        expect(formatWeaponMetaRate(null)).toBe("—")
    })
})

describe("formatWeaponMetaCount", () => {
    it("groups thousands the same way on both sides of the render", () => {
        expect(formatWeaponMetaCount(12_480)).toBe("12,480")
        expect(formatWeaponMetaCount(0)).toBe("0")
    })

    it("rounds a per-game average to a whole number", () => {
        expect(formatWeaponMetaCount(310.4)).toBe("310")
        expect(formatWeaponMetaCount(1_204.6)).toBe("1,205")
    })

    it("renders a missing count as a dash", () => {
        expect(formatWeaponMetaCount(null)).toBe("—")
    })
})

describe("formatWeaponMetaDuration", () => {
    it("keeps a short hold in seconds", () => {
        expect(formatWeaponMetaDuration(42)).toBe("42s")
        expect(formatWeaponMetaDuration(0)).toBe("0s")
    })

    it("splits a minute-scale hold into minutes and seconds", () => {
        expect(formatWeaponMetaDuration(72)).toBe("1m 12s")
        expect(formatWeaponMetaDuration(120)).toBe("2m")
    })

    it("drops the seconds once the hold reaches an hour", () => {
        expect(formatWeaponMetaDuration(3_672)).toBe("1h 1m")
        expect(formatWeaponMetaDuration(7_200)).toBe("2h")
    })

    it("renders a missing hold as a dash", () => {
        expect(formatWeaponMetaDuration(null)).toBe("—")
    })
})

describe("weaponMetaSample", () => {
    it("names the indexed population", () => {
        expect(weaponMetaSample(12_480)).toBe("Across 12,480 indexed accounts")
    })
})

describe("weaponPlayShareRank", () => {
    it("counts the weapons with a larger play share", () => {
        const rows = [
            row("Sword", { playShare: 0.4 }),
            row("Axe", { playShare: 0.3 }),
            row("Bow", { playShare: 0.2 }),
        ]

        expect(weaponPlayShareRank(rows, "Axe")).toEqual({
            position: 2,
            total: 3,
        })
    })

    it("gives tied weapons the same position", () => {
        const rows = [
            row("Sword", { playShare: 0.4 }),
            row("Axe", { playShare: 0.3 }),
            row("Bow", { playShare: 0.3 }),
        ]

        expect(weaponPlayShareRank(rows, "Axe")).toEqual({
            position: 2,
            total: 3,
        })
        expect(weaponPlayShareRank(rows, "Bow")).toEqual({
            position: 2,
            total: 3,
        })
    })

    it("gives a one-weapon sample the first position", () => {
        expect(
            weaponPlayShareRank([row("Sword", { playShare: 1 })], "Sword"),
        ).toEqual({ position: 1, total: 1 })
    })

    it("returns nothing when the weapon is absent from the sample", () => {
        expect(weaponPlayShareRank([row("Sword")], "Axe")).toBeNull()
        expect(weaponPlayShareRank([], "Sword")).toBeNull()
    })

    it("returns nothing for a row without a play share", () => {
        expect(
            weaponPlayShareRank([row("Sword", { playShare: null })], "Sword"),
        ).toBeNull()
    })
})

describe("weaponMetaRankLabel", () => {
    it("names the position and the sample it is measured against", () => {
        expect(weaponMetaRankLabel({ position: 4, total: 15 })).toBe(
            "#4 of 15 by play share",
        )
    })
})
