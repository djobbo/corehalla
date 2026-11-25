import { describe, expect, it } from "@effect/vitest"
import { weapons } from "@crh/bhapi/constants"
import { compareBy } from "./useSortBy"
import type { WeaponMetaRow } from "./weaponMeta"
import {
    formatWeaponMetaCount,
    formatWeaponMetaDuration,
    formatWeaponMetaRate,
    weaponMetaAverage,
    weaponMetaDefaultDirection,
    weaponMetaDefaultSort,
    weaponMetaRank,
    weaponMetaRankLabel,
    weaponMetaSorts,
    weaponMetaTableRows,
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

describe("weaponMetaAverage", () => {
    it("keeps one decimal so a per-game spread stays visible", () => {
        expect(weaponMetaAverage(0.94)).toBe("0.9")
        expect(weaponMetaAverage(1.06)).toBe("1.1")
    })

    it("renders a missing average as a dash", () => {
        expect(weaponMetaAverage(null)).toBe("—")
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

const rankedRows = [
    row("Sword", {
        playShare: 0.4,
        winRate: 0.51,
        games: 300,
        accounts: 30,
        damagePerGame: 300,
        timeHeldPerGame: 90,
    }),
    row("Axe", {
        playShare: 0.3,
        winRate: 0.53,
        games: 200,
        accounts: 20,
        damagePerGame: 400,
        timeHeldPerGame: 120,
    }),
    row("Bow", {
        playShare: 0.2,
        winRate: 0.5,
        games: 100,
        accounts: 10,
        damagePerGame: 350,
        timeHeldPerGame: 60,
    }),
]

describe("weaponMetaRank", () => {
    it("ranks the weapon on every metric the card shows", () => {
        expect(weaponMetaRank(rankedRows, "Bow", "playShare")).toEqual({
            position: 3,
            total: 3,
        })
        expect(weaponMetaRank(rankedRows, "Bow", "winRate")).toEqual({
            position: 3,
            total: 3,
        })
        expect(weaponMetaRank(rankedRows, "Bow", "games")).toEqual({
            position: 3,
            total: 3,
        })
        expect(weaponMetaRank(rankedRows, "Bow", "accounts")).toEqual({
            position: 3,
            total: 3,
        })
        expect(weaponMetaRank(rankedRows, "Bow", "damagePerGame")).toEqual({
            position: 2,
            total: 3,
        })
        expect(weaponMetaRank(rankedRows, "Bow", "timeHeldPerGame")).toEqual({
            position: 3,
            total: 3,
        })
    })

    it("gives tied weapons the same position", () => {
        const rows = [
            row("Sword", { winRate: 0.53 }),
            row("Axe", { winRate: 0.5 }),
            row("Bow", { winRate: 0.5 }),
        ]

        expect(weaponMetaRank(rows, "Axe", "winRate")).toEqual({
            position: 2,
            total: 3,
        })
        expect(weaponMetaRank(rows, "Bow", "winRate")).toEqual({
            position: 2,
            total: 3,
        })
    })

    it("measures a metric against the weapons that report it", () => {
        const rows = [
            row("Sword", { damagePerGame: 400 }),
            row("Axe", { damagePerGame: null }),
            row("Bow", { damagePerGame: 300 }),
        ]

        expect(weaponMetaRank(rows, "Bow", "damagePerGame")).toEqual({
            position: 2,
            total: 2,
        })
        expect(weaponMetaRank(rows, "Axe", "damagePerGame")).toBeNull()
    })

    it("gives a one-weapon sample the first position", () => {
        expect(
            weaponMetaRank([row("Sword", { games: 10 })], "Sword", "games"),
        ).toEqual({ position: 1, total: 1 })
    })

    it("returns nothing when the weapon is absent from the sample", () => {
        expect(weaponMetaRank([row("Sword")], "Axe", "playShare")).toBeNull()
        expect(weaponMetaRank([], "Sword", "playShare")).toBeNull()
    })
})

describe("weaponMetaRankLabel", () => {
    it("names the position, the sample and the metric", () => {
        expect(
            weaponMetaRankLabel({ position: 4, total: 15 }, "playShare"),
        ).toBe("#4 of 15 by play share")
        expect(
            weaponMetaRankLabel({ position: 11, total: 15 }, "winRate"),
        ).toBe("#11 of 15 by win rate")
        expect(weaponMetaRankLabel({ position: 2, total: 15 }, "games")).toBe(
            "#2 of 15 by games",
        )
        expect(
            weaponMetaRankLabel({ position: 3, total: 15 }, "accounts"),
        ).toBe("#3 of 15 by accounts")
        expect(
            weaponMetaRankLabel({ position: 5, total: 15 }, "damagePerGame"),
        ).toBe("#5 of 15 by damage per game")
        expect(
            weaponMetaRankLabel({ position: 6, total: 15 }, "timeHeldPerGame"),
        ).toBe("#6 of 15 by time held per game")
    })
})

const tableRow = (
    weapon: WeaponMetaRow["weapon"],
    over: Partial<WeaponMetaRow> = {},
): ReturnType<typeof weaponMetaTableRows>[number] => ({
    weapon,
    meta: row(weapon, over),
})

describe("weaponMetaTableRows", () => {
    it("keeps every weapon in the catalogue, even one the sample skips", () => {
        const rows = weaponMetaTableRows({
            data: [row("Sword")],
            meta: { accounts: 10, ratingFloor: null },
        })

        expect(rows.map((entry) => entry.weapon)).toEqual([...weapons])
        expect(
            rows.find((entry) => entry.weapon === "Sword")?.meta?.playShare,
        ).toBe(0.25)
        expect(
            rows.find((entry) => entry.weapon === "Chakram")?.meta,
        ).toBeNull()
    })
})

describe("weaponMetaSorts", () => {
    it("opens on play share, highest first", () => {
        expect(weaponMetaDefaultSort).toBe("playShare")
        expect(weaponMetaDefaultDirection).toBe("desc")
    })

    it("orders real values by the chosen metric", () => {
        const rows = [
            tableRow("Sword", { kosPerGame: 0.9 }),
            tableRow("Gauntlets", { kosPerGame: 1.2 }),
            tableRow("Axe", { kosPerGame: 0.4 }),
        ]

        expect(
            [...rows]
                .sort(compareBy(weaponMetaSorts.kosPerGame, "desc"))
                .map((entry) => entry.weapon),
        ).toEqual(["Gauntlets", "Sword", "Axe"])
    })

    it("sorts a weapon without the metric behind every weapon that has one", () => {
        const rows = [
            tableRow("Axe", { timeHeldPerGame: null }),
            tableRow("Sword", { timeHeldPerGame: 90 }),
            { weapon: "Chakram" as const, meta: null },
        ]

        expect(
            [...rows]
                .sort(compareBy(weaponMetaSorts.timeHeldPerGame, "desc"))
                .map((entry) => entry.weapon),
        ).toEqual(["Sword", "Axe", "Chakram"])

        expect(
            [...rows]
                .sort(compareBy(weaponMetaSorts.timeHeldPerGame, "asc"))
                .map((entry) => entry.weapon),
        ).toEqual(["Sword", "Axe", "Chakram"])
    })
})
