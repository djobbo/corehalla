import { describe, expect, it } from "@effect/vitest"
import { buildLegendMeta } from "./meta"

const sample = {
    accounts: 18_204,
    floor: "1800",
} as const

describe("buildLegendMeta", () => {
    it("rounds win rate and play share to four decimals", () => {
        const board = buildLegendMeta(
            [
                { legendId: 3, games: 200, wins: 150, accounts: 120 },
                { legendId: 4, games: 100, wins: 50, accounts: 80 },
            ],
            sample,
        )

        expect(board.data).toEqual([
            {
                legendId: 3,
                slug: "3-bdvar",
                games: 200,
                wins: 150,
                winRate: 0.75,
                playShare: 0.6667,
                accounts: 120,
            },
            {
                legendId: 4,
                slug: "4-cassidy",
                games: 100,
                wins: 50,
                winRate: 0.5,
                playShare: 0.3333,
                accounts: 80,
            },
        ])
    })

    it("guards a zero-game sample instead of producing NaN", () => {
        const board = buildLegendMeta(
            [{ legendId: 3, games: 10, wins: 5, accounts: 1 }],
            sample,
        )

        expect(board.data[0]?.playShare).toBe(1)
        expect(board.data[0]?.winRate).toBe(0.5)
    })

    it("drops a legend with no games in the sample", () => {
        const board = buildLegendMeta(
            [
                { legendId: 3, games: 10, wins: 5, accounts: 1 },
                { legendId: 4, games: 0, wins: 0, accounts: 1 },
            ],
            sample,
        )

        expect(board.data.map((row) => row.legendId)).toEqual([3])
        expect(board.data[0]?.playShare).toBe(1)
    })

    it("drops an id that is not in the roster", () => {
        const board = buildLegendMeta(
            [{ legendId: 9999, games: 10, wins: 5, accounts: 1 }],
            sample,
        )

        expect(board.data).toEqual([])
    })

    it("carries the sample size and floor onto the envelope", () => {
        const board = buildLegendMeta([], {
            accounts: 0,
            floor: "2200",
        })

        expect(board.data).toEqual([])
        expect(board.meta).toEqual({ accounts: 0, ratingFloor: 2200 })
    })

    it("reports a null floor for the whole index", () => {
        expect(buildLegendMeta([], { accounts: 4, floor: "all" }).meta).toEqual(
            { accounts: 4, ratingFloor: null },
        )
    })
})
