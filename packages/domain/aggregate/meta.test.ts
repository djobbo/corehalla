import { describe, expect, it } from "@effect/vitest"
import { buildLegendMeta, buildWeaponMeta } from "./meta"
import type { LegendMetaRowInput } from "./meta"

const sample = {
    accounts: 18_204,
    floor: "1800",
} as const

const playStyle = {
    accounts: 10,
    damageDealt: 30_000,
    damageTaken: 29_000,
    kos: 210,
    falls: 155,
    suicides: 3,
    matchTime: 30_000,
    timeHeldWeaponOne: 7_000,
    timeHeldWeaponTwo: 5_000,
} as const

const row = (
    legendId: number,
    over: Partial<LegendMetaRowInput> = {},
): LegendMetaRowInput => ({
    legendId,
    games: 150,
    wins: 75,
    accounts: 10,
    playStyle,
    ...over,
})

describe("buildLegendMeta", () => {
    it("rounds win rate and play share to four decimals", () => {
        const board = buildLegendMeta(
            [
                row(3, { games: 200, wins: 150, accounts: 120 }),
                row(4, { games: 100, wins: 50, accounts: 80 }),
            ],
            sample,
        )

        expect(board.data).toMatchObject([
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

    it("divides the play-style totals per game, not per account", () => {
        const board = buildLegendMeta([row(3)], sample)

        expect(board.data[0]?.playStyle).toEqual({
            accounts: 10,
            damageDealtPerGame: 200,
            damageTakenPerGame: 193.33,
            kosPerGame: 1.4,
            fallsPerGame: 1.03,
            suicidesPer100Games: 2,
            averageMatchSeconds: 200,
            weaponOneShare: 0.5833,
            weaponTwoShare: 0.4167,
        })
    })

    it("rounds the average match length to whole seconds", () => {
        const board = buildLegendMeta(
            [
                row(3, {
                    games: 4,
                    playStyle: { ...playStyle, matchTime: 1_234 },
                }),
            ],
            sample,
        )

        expect(board.data[0]?.playStyle.averageMatchSeconds).toBe(309)
    })

    it("complements the weapon shares so the split sums to one", () => {
        const board = buildLegendMeta(
            [
                row(3, {
                    playStyle: {
                        ...playStyle,
                        timeHeldWeaponOne: 1,
                        timeHeldWeaponTwo: 2,
                    },
                }),
            ],
            sample,
        )

        const split = board.data[0]?.playStyle

        expect(split?.weaponOneShare).toBe(0.3333)
        expect(split?.weaponTwoShare).toBe(0.6667)
        expect(
            (split?.weaponOneShare ?? 0) + (split?.weaponTwoShare ?? 0),
        ).toBe(1)
    })

    it("leaves the weapon split null when no time was held", () => {
        const board = buildLegendMeta(
            [
                row(3, {
                    playStyle: {
                        ...playStyle,
                        timeHeldWeaponOne: 0,
                        timeHeldWeaponTwo: 0,
                    },
                }),
            ],
            sample,
        )

        expect(board.data[0]?.playStyle).toMatchObject({
            weaponOneShare: null,
            weaponTwoShare: null,
        })
    })

    it("guards a zero-game sample instead of producing NaN", () => {
        const board = buildLegendMeta([row(3, { games: 10, wins: 5 })], sample)

        expect(board.data[0]?.playShare).toBe(1)
        expect(board.data[0]?.winRate).toBe(0.5)
    })

    it("drops a legend with no games in the sample", () => {
        const board = buildLegendMeta(
            [row(3), row(4, { games: 0, wins: 0 })],
            sample,
        )

        expect(board.data.map((entry) => entry.legendId)).toEqual([3])
        expect(board.data[0]?.playShare).toBe(1)
    })

    it("drops an id that is not in the roster", () => {
        const board = buildLegendMeta([row(9999)], sample)

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
    const sample = { accounts: 18_204, floor: "all" } as const

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

    it("carries the sample size and floor onto the envelope", () => {
        expect(buildWeaponMeta([], { accounts: 0, floor: "2000" })).toEqual({
            data: [],
            meta: { accounts: 0, ratingFloor: 2000 },
        })
    })

    it("reports a null floor for the whole index", () => {
        expect(buildWeaponMeta([], { accounts: 4, floor: "all" }).meta).toEqual(
            { accounts: 4, ratingFloor: null },
        )
    })
})
