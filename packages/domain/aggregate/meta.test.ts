import { describe, expect, it } from "@effect/vitest"
import { buildLegendMeta, buildWeaponMeta } from "./meta"

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

describe("buildWeaponMeta", () => {
    const sample = { accounts: 18_204 }

    it("derives rates and per-game totals per weapon", () => {
        const board = buildWeaponMeta(
            [
                {
                    weapon: "Sword",
                    games: 200,
                    wins: 150,
                    accounts: 120,
                    damageDealt: 62_000,
                    matchTime: 24_000,
                    kos: 180,
                },
                {
                    weapon: "Axe",
                    games: 100,
                    wins: 50,
                    accounts: 80,
                    damageDealt: 15_500,
                    matchTime: 6_000,
                    kos: 45,
                },
            ],
            sample,
        )

        expect(board.data).toEqual([
            {
                weapon: "Sword",
                games: 200,
                wins: 150,
                winRate: 0.75,
                playShare: 0.6667,
                accounts: 120,
                damagePerGame: 310,
                timeHeldPerGame: 120,
                kosPerGame: 0.9,
            },
            {
                weapon: "Axe",
                games: 100,
                wins: 50,
                winRate: 0.5,
                playShare: 0.3333,
                accounts: 80,
                damagePerGame: 155,
                timeHeldPerGame: 60,
                kosPerGame: 0.45,
            },
        ])
    })

    it("divides play share by every weapon game in the sample", () => {
        const board = buildWeaponMeta(
            [
                {
                    weapon: "Sword",
                    games: 300,
                    wins: 150,
                    accounts: 10,
                    damageDealt: 0,
                    matchTime: 0,
                    kos: 0,
                },
                {
                    weapon: "Axe",
                    games: 100,
                    wins: 50,
                    accounts: 5,
                    damageDealt: 0,
                    matchTime: 0,
                    kos: 0,
                },
            ],
            sample,
        )

        expect(board.data.map((row) => row.playShare)).toEqual([0.75, 0.25])
    })

    it("drops a weapon with no games instead of dividing by it", () => {
        const board = buildWeaponMeta(
            [
                {
                    weapon: "Sword",
                    games: 100,
                    wins: 50,
                    accounts: 10,
                    damageDealt: 0,
                    matchTime: 0,
                    kos: 0,
                },
                {
                    weapon: "Bow",
                    games: 0,
                    wins: 0,
                    accounts: 1,
                    damageDealt: 0,
                    matchTime: 0,
                    kos: 0,
                },
            ],
            sample,
        )

        expect(board.data.map((row) => row.weapon)).toEqual(["Sword"])
        expect(board.data[0]?.winRate).toBe(0.5)
        expect(board.data[0]?.damagePerGame).toBe(0)
        expect(board.data[0]?.timeHeldPerGame).toBe(0)
        expect(board.data[0]?.kosPerGame).toBe(0)
    })

    it("drops a weapon name outside the roster", () => {
        const board = buildWeaponMeta(
            [
                {
                    weapon: "Laser",
                    games: 100,
                    wins: 50,
                    accounts: 10,
                    damageDealt: 0,
                    matchTime: 0,
                    kos: 0,
                },
            ],
            sample,
        )

        expect(board.data).toEqual([])
    })

    it("gives a one-weapon sample the whole play share", () => {
        const board = buildWeaponMeta(
            [
                {
                    weapon: "Gauntlets",
                    games: 10,
                    wins: 4,
                    accounts: 1,
                    damageDealt: 3_100,
                    matchTime: 900,
                    kos: 9,
                },
            ],
            sample,
        )

        expect(board.data[0]).toMatchObject({
            weapon: "Gauntlets",
            games: 10,
            winRate: 0.4,
            playShare: 1,
            damagePerGame: 310,
            timeHeldPerGame: 90,
            kosPerGame: 0.9,
        })
    })

    it("carries the sample size onto the envelope", () => {
        expect(buildWeaponMeta([], { accounts: 0 })).toEqual({
            data: [],
            meta: { accounts: 0 },
        })
    })
})
