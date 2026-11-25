import { describe, expect, it } from "@effect/vitest"
import {
    damageSplitEntries,
    formatPlayStyleMatchLength,
    formatPlayStylePerGame,
    formatPlayStyleShare,
    playStyleSample,
    playStyleUnknown,
} from "./legendPlayStyle"

describe("formatPlayStylePerGame", () => {
    it("keeps two decimals only when they carry information", () => {
        expect(formatPlayStylePerGame(412.75)).toBe("412.75")
        expect(formatPlayStylePerGame(412.7)).toBe("412.7")
        expect(formatPlayStylePerGame(412)).toBe("412")
    })

    it("rounds the per-game average to two decimals", () => {
        expect(formatPlayStylePerGame(193.3333)).toBe("193.33")
        expect(formatPlayStylePerGame(1.0333)).toBe("1.03")
    })

    it("renders a dash when the sample has no input", () => {
        expect(formatPlayStylePerGame(null)).toBe(playStyleUnknown)
    })
})

describe("formatPlayStyleMatchLength", () => {
    it("reads a per-game average as minutes and seconds", () => {
        expect(formatPlayStyleMatchLength(200)).toBe("3m 20s")
        expect(formatPlayStyleMatchLength(59)).toBe("59s")
        expect(formatPlayStyleMatchLength(0)).toBe("0s")
    })

    it("rounds to a whole second without a 60-second remainder", () => {
        expect(formatPlayStyleMatchLength(59.6)).toBe("1m 0s")
    })

    it("renders a dash when the sample has no input", () => {
        expect(formatPlayStyleMatchLength(null)).toBe(playStyleUnknown)
    })
})

describe("formatPlayStyleShare", () => {
    it("renders a fraction of held time as a percentage", () => {
        expect(formatPlayStyleShare(0.5833)).toBe("58.33%")
        expect(formatPlayStyleShare(1)).toBe("100%")
    })

    it("renders a dash when no time was held", () => {
        expect(formatPlayStyleShare(null)).toBe(playStyleUnknown)
    })
})

describe("damageSplitEntries", () => {
    const weapons = { one: "Bow", two: "Gauntlets" } as const

    it("labels each damage bucket with its percentage", () => {
        const entries = damageSplitEntries(
            {
                weaponOne: 0.6667,
                weaponTwo: 0.1905,
                unarmed: 0.0833,
                gadgets: 0.0405,
                thrownItem: 0.019,
            },
            weapons,
        )

        expect(entries?.map((entry) => [entry.label, entry.formatted])).toEqual(
            [
                ["Bow", "66.67%"],
                ["Gauntlets", "19.05%"],
                ["Unarmed", "8.33%"],
                ["Gadgets", "4.05%"],
                ["Thrown items", "1.9%"],
            ],
        )
    })

    it("gives every bucket its own bar colour", () => {
        const entries = damageSplitEntries(
            {
                weaponOne: 0.4,
                weaponTwo: 0.3,
                unarmed: 0.15,
                gadgets: 0.1,
                thrownItem: 0.05,
            },
            weapons,
        )

        expect(new Set(entries?.map((entry) => entry.intent)).size).toBe(5)
    })

    it("renders no split when every share is absent", () => {
        expect(
            damageSplitEntries(
                {
                    weaponOne: null,
                    weaponTwo: null,
                    unarmed: null,
                    gadgets: null,
                    thrownItem: null,
                },
                weapons,
            ),
        ).toBeNull()
    })

    it("renders no split when any share is missing", () => {
        expect(
            damageSplitEntries(
                {
                    weaponOne: 0.9,
                    weaponTwo: 0.1,
                    unarmed: null,
                    gadgets: 0,
                    thrownItem: 0,
                },
                weapons,
            ),
        ).toBeNull()
    })
})

describe("playStyleSample", () => {
    it("names the sample size and disclaims official figures", () => {
        expect(playStyleSample(12_480)).toBe(
            "Across 12,480 indexed accounts · aggregated from Corehalla's index, not official Brawlhalla figures.",
        )
    })

    it("keeps a small sample visible instead of rounding it away", () => {
        expect(playStyleSample(3)).toContain("Across 3 indexed accounts")
    })
})
