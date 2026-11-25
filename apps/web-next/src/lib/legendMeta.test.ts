import { describe, expect, it } from "@effect/vitest"
import type { LegendMetaRow } from "./legendMeta"
import type { LegendPlayStyle } from "@crh/api-contract/schemas"
import {
    formatLegendMetaCount,
    formatLegendMetaRate,
    legendMetaEmpty,
    legendMetaFloorLabel,
    legendMetaRank,
    legendMetaRankLabel,
    legendMetaSample,
    legendMetaSorts,
    resolveLegendMetaFloor,
} from "./legendMeta"

const playStyle = (over: Partial<LegendPlayStyle> = {}): LegendPlayStyle => ({
    accounts: 10,
    damageDealtPerGame: 412.75,
    damageTakenPerGame: 380.2,
    kosPerGame: 1.4,
    fallsPerGame: 1.03,
    suicidesPer100Games: 0.82,
    averageMatchSeconds: 200,
    weaponOneShare: 0.6,
    weaponTwoShare: 0.4,
    ...over,
})

const row = (
    legendId: number,
    over: Partial<LegendMetaRow> = {},
): LegendMetaRow => ({
    legendId,
    slug: `${legendId}-legend`,
    games: 100,
    wins: 50,
    winRate: 0.5,
    playShare: 0.25,
    accounts: 10,
    playStyle: playStyle(),
    ...over,
})

describe("formatLegendMetaRate", () => {
    it("renders a fraction as a percentage", () => {
        expect(formatLegendMetaRate(0.1234)).toBe("12.34%")
        expect(formatLegendMetaRate(0.5)).toBe("50%")
        expect(formatLegendMetaRate(1)).toBe("100%")
    })

    it("drops trailing zeros instead of padding them", () => {
        expect(formatLegendMetaRate(0.06)).toBe("6%")
        expect(formatLegendMetaRate(0.0667)).toBe("6.67%")
    })

    it("renders an empty sample as zero, not NaN", () => {
        expect(formatLegendMetaRate(0)).toBe("0%")
    })
})

describe("formatLegendMetaCount", () => {
    it("groups thousands the same way on both sides of the render", () => {
        expect(formatLegendMetaCount(18204)).toBe("18,204")
        expect(formatLegendMetaCount(0)).toBe("0")
    })
})

describe("legendMetaSample", () => {
    it("states the whole indexed population", () => {
        expect(legendMetaSample(18204, "all")).toBe(
            "Across 18,204 indexed accounts",
        )
    })

    it("names the rating floor", () => {
        expect(legendMetaSample(18204, "1800")).toBe(
            "Across 18,204 indexed accounts at 1800+ rating",
        )
    })
})

describe("legendMetaEmpty", () => {
    it("names the filter that has no rows", () => {
        expect(legendMetaEmpty("2200")).toBe(
            "No legend games are indexed at 2200+ rating yet.",
        )
        expect(legendMetaEmpty("all")).toBe("No legend games are indexed yet.")
    })
})

describe("legendMetaFloorLabel", () => {
    it("labels every floor in the filter", () => {
        expect(legendMetaFloorLabel("all")).toBe("All")
        expect(legendMetaFloorLabel("1500")).toBe("1500+")
    })
})

describe("resolveLegendMetaFloor", () => {
    it("accepts every floor the API offers", () => {
        expect(resolveLegendMetaFloor("1800")).toBe("1800")
        expect(resolveLegendMetaFloor("all")).toBe("all")
    })

    it("falls back to the whole index for an unknown filter", () => {
        expect(resolveLegendMetaFloor("9999")).toBe("all")
        expect(resolveLegendMetaFloor(undefined)).toBe("all")
    })
})

describe("legendMetaSorts", () => {
    it("offers play share, win rate, games and accounts", () => {
        expect(Object.keys(legendMetaSorts)).toEqual([
            "playShare",
            "winRate",
            "games",
            "accounts",
        ])
    })

    it("compares play share and win rate numerically", () => {
        const rows = [row(3, { playShare: 0.5 }), row(4, { playShare: 0.2 })]

        expect(
            [...rows]
                .sort(legendMetaSorts.playShare.compare)
                .map((r) => r.legendId),
        ).toEqual([4, 3])
    })

    it("compares games and accounts numerically", () => {
        const rows = [
            row(3, { games: 10, accounts: 2 }),
            row(4, { games: 400, accounts: 90 }),
        ]

        expect(
            [...rows]
                .sort(legendMetaSorts.games.compare)
                .map((r) => r.legendId),
        ).toEqual([3, 4])
        expect(
            [...rows]
                .sort(legendMetaSorts.accounts.compare)
                .map((r) => r.legendId),
        ).toEqual([3, 4])
    })

    it("keeps the incoming order on a tie", () => {
        const rows = [row(3, { playShare: 0.4 }), row(5, { playShare: 0.4 })]

        expect(
            [...rows]
                .sort(legendMetaSorts.playShare.compare)
                .map((r) => r.legendId),
        ).toEqual([3, 5])
    })
})

describe("legendMetaRank", () => {
    it("counts the legends ahead on the metric", () => {
        const rows = [
            row(3, { playShare: 0.4 }),
            row(4, { playShare: 0.25 }),
            row(5, { playShare: 0.1 }),
        ]

        expect(legendMetaRank(rows, 4, "playShare")).toEqual({
            position: 2,
            total: 3,
        })
    })

    it("gives tied legends the same position", () => {
        const rows = [
            row(3, { winRate: 0.53 }),
            row(4, { winRate: 0.5 }),
            row(5, { winRate: 0.5 }),
        ]

        expect(legendMetaRank(rows, 4, "winRate")).toEqual({
            position: 2,
            total: 3,
        })
        expect(legendMetaRank(rows, 5, "winRate")).toEqual({
            position: 2,
            total: 3,
        })
    })

    it("gives a one-row board the first position", () => {
        expect(legendMetaRank([row(3, { games: 10 })], 3, "games")).toEqual({
            position: 1,
            total: 1,
        })
    })

    it("returns nothing for a legend the board does not list", () => {
        expect(legendMetaRank([row(3)], 4, "playShare")).toBeNull()
        expect(legendMetaRank([], 3, "playShare")).toBeNull()
    })

    it("returns nothing for a metric the legend does not report", () => {
        const rows = [
            row(3, { playStyle: playStyle({ damageDealtPerGame: null }) }),
            row(4, { playStyle: playStyle({ damageDealtPerGame: 300 }) }),
        ]

        expect(legendMetaRank(rows, 3, "damageDealtPerGame")).toBeNull()
    })

    it("measures a play-style metric against the reporting legends", () => {
        const rows = [
            row(3, { playStyle: playStyle({ averageMatchSeconds: 240 }) }),
            row(4, { playStyle: playStyle({ averageMatchSeconds: 180 }) }),
            row(5, { playStyle: playStyle({ averageMatchSeconds: null }) }),
        ]

        expect(legendMetaRank(rows, 3, "averageMatchSeconds")).toEqual({
            position: 1,
            total: 2,
        })
        expect(legendMetaRank(rows, 4, "averageMatchSeconds")).toEqual({
            position: 2,
            total: 2,
        })
    })
})

describe("legendMetaRankLabel", () => {
    it("names the position and the legends that report the metric", () => {
        expect(legendMetaRankLabel({ position: 4, total: 15 })).toBe("#4 of 15")
    })
})
