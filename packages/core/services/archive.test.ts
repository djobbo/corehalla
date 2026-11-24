import { DatabaseSync } from "node:sqlite"
import { Effect } from "effect"
import { describe, expect, it } from "@effect/vitest"
import { buildLegendMeta } from "@crh/domain/aggregate/meta"
import { Database, makeLayer } from "./archive"
import type { D1Database } from "@crh/db/client"

type Fixture = {
    readonly accounts: readonly {
        readonly id: string
        readonly rating: number
    }[]
    readonly legends: readonly {
        readonly playerId: string
        readonly legendId: number
        readonly games: number
        readonly wins: number
    }[]
    readonly weapons?: readonly {
        readonly playerId: string
        readonly weapon: string
        readonly games: number
        readonly wins: number
        readonly damageDealt: number
        readonly kos: number
        readonly matchTime: number
    }[]
}

/** Minimal D1 surface the Effect SQL client uses, over an in-memory SQLite. */
const toD1 = (sqlite: DatabaseSync): D1Database => {
    const statement = (query: string, params: readonly unknown[] = []) => ({
        bind: (...next: readonly unknown[]) => statement(query, next),
        all: async () => ({
            results: sqlite.prepare(query).all(...(params as never[])),
            success: true,
            meta: {},
        }),
        raw: async () =>
            (
                sqlite.prepare(query).all(...(params as never[])) as Record<
                    string,
                    unknown
                >[]
            ).map((row) => Object.values(row)),
        async run() {
            sqlite.prepare(query).run(...(params as never[]))
            return { results: [], success: true, meta: {} }
        },
        async first(column?: string) {
            const row = sqlite.prepare(query).get(...(params as never[])) as
                | Record<string, unknown>
                | undefined

            return column === undefined ? row : row?.[column]
        },
    })

    return {
        prepare: (query: string) => statement(query),
        batch: async (statements: readonly { all: () => unknown }[]) =>
            statements.map((entry) => entry.all()),
        exec: async () => ({ count: 0, duration: 0 }),
        async dump() {
            throw new Error("dump is not supported in tests")
        },
    } as unknown as D1Database
}

const layerFor = (fixture: Fixture) => {
    const sqlite = new DatabaseSync(":memory:")

    sqlite.exec(`
        CREATE TABLE "BHPlayerData" ("id" TEXT PRIMARY KEY, "rating" INTEGER NOT NULL);
        CREATE TABLE "BHPlayerLegend" (
            "player_id" TEXT NOT NULL,
            "legend_id" INTEGER NOT NULL,
            "games" INTEGER NOT NULL,
            "wins" INTEGER NOT NULL,
            PRIMARY KEY ("player_id", "legend_id")
        );
        CREATE TABLE "BHPlayerWeapon" (
            "player_id" TEXT NOT NULL,
            "weapon_name" TEXT NOT NULL,
            "games" INTEGER NOT NULL,
            "wins" INTEGER NOT NULL,
            "damageDealt" INTEGER NOT NULL,
            "kos" INTEGER NOT NULL,
            "matchTime" INTEGER NOT NULL,
            PRIMARY KEY ("player_id", "weapon_name")
        );
    `)

    const insertAccount = sqlite.prepare(
        `INSERT INTO "BHPlayerData" ("id", "rating") VALUES (?, ?)`,
    )
    const insertLegend = sqlite.prepare(
        `INSERT INTO "BHPlayerLegend" ("player_id", "legend_id", "games", "wins")
         VALUES (?, ?, ?, ?)`,
    )
    const insertWeapon = sqlite.prepare(
        `INSERT INTO "BHPlayerWeapon" ("player_id", "weapon_name", "games", "wins", "damageDealt", "kos", "matchTime")
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )

    for (const account of fixture.accounts) {
        insertAccount.run(account.id, account.rating)
    }

    for (const legend of fixture.legends) {
        insertLegend.run(
            legend.playerId,
            legend.legendId,
            legend.games,
            legend.wins,
        )
    }

    for (const weapon of fixture.weapons ?? []) {
        insertWeapon.run(
            weapon.playerId,
            weapon.weapon,
            weapon.games,
            weapon.wins,
            weapon.damageDealt,
            weapon.kos,
            weapon.matchTime,
        )
    }

    return makeLayer(toD1(sqlite))
}

const readMeta = (fixture: Fixture, minRating: number | null) =>
    Effect.gen(function* () {
        const db = yield* Database

        return yield* db.getLegendMeta(minRating)
    }).pipe(Effect.provide(layerFor(fixture)))

const ranked: Fixture = {
    accounts: [
        { id: "1", rating: 2000 },
        { id: "2", rating: 1800 },
        { id: "3", rating: 1799 },
        { id: "4", rating: 0 },
    ],
    legends: [
        { playerId: "1", legendId: 3, games: 100, wins: 60 },
        { playerId: "1", legendId: 4, games: 40, wins: 10 },
        { playerId: "2", legendId: 3, games: 10, wins: 5 },
        { playerId: "2", legendId: 5, games: 50, wins: 25 },
        { playerId: "3", legendId: 3, games: 900, wins: 800 },
        { playerId: "4", legendId: 3, games: 1, wins: 0 },
    ],
}

describe("getLegendMeta", () => {
    it.effect("sums games and wins per legend across accounts", () =>
        Effect.gen(function* () {
            const sample = yield* readMeta(ranked, 1800)

            expect(sample.rows).toEqual([
                { legendId: 3, games: 110, wins: 65, accounts: 2 },
                { legendId: 4, games: 40, wins: 10, accounts: 1 },
                { legendId: 5, games: 50, wins: 25, accounts: 1 },
            ])
        }),
    )

    it.effect("divides play share by every legend game in the sample", () =>
        Effect.gen(function* () {
            const sample = yield* readMeta(ranked, 1800)
            const board = buildLegendMeta(sample.rows, {
                accounts: sample.accounts,
                floor: "1800",
            })

            expect(
                board.data.map((row) => [row.legendId, row.playShare]),
            ).toEqual([
                [3, 0.55],
                [4, 0.2],
                [5, 0.25],
            ])
        }),
    )

    it.effect("includes an account sitting exactly on the floor", () =>
        Effect.gen(function* () {
            const sample = yield* readMeta(ranked, 1800)

            // Account 2 is rated exactly 1800; account 3 at 1799 is below.
            expect(sample.rows[0]?.games).toBe(110)
        }),
    )

    it.effect("counts the accounts matching the floor as the sample size", () =>
        Effect.gen(function* () {
            expect((yield* readMeta(ranked, 1800)).accounts).toBe(2)
        }),
    )

    it.effect("includes every indexed account for the all-ratings floor", () =>
        Effect.gen(function* () {
            const sample = yield* readMeta(ranked, null)

            expect(sample.accounts).toBe(4)
            expect(sample.rows[0]).toEqual({
                legendId: 3,
                games: 1011,
                wins: 865,
                accounts: 4,
            })
        }),
    )

    it.effect("reads an empty archive as an empty sample", () =>
        Effect.gen(function* () {
            const sample = yield* readMeta({ accounts: [], legends: [] }, null)

            expect(sample).toEqual({ rows: [], accounts: 0 })
        }),
    )

    it.effect("gives a single-legend sample the whole play share", () =>
        Effect.gen(function* () {
            const sample = yield* readMeta(
                {
                    accounts: [{ id: "1", rating: 2100 }],
                    legends: [
                        {
                            playerId: "1",
                            legendId: 3,
                            games: 10,
                            wins: 4,
                        },
                    ],
                },
                2000,
            )

            const board = buildLegendMeta(sample.rows, {
                accounts: sample.accounts,
                floor: "2000",
            })

            expect(board.data[0]).toMatchObject({
                games: 10,
                winRate: 0.4,
                playShare: 1,
            })
        }),
    )
})

const readWeaponMeta = (fixture: Fixture) =>
    Effect.gen(function* () {
        const db = yield* Database

        return yield* db.getWeaponMeta()
    }).pipe(Effect.provide(layerFor(fixture)))

const weaponSample: Fixture = {
    accounts: [
        { id: "1", rating: 2000 },
        { id: "2", rating: 1800 },
        { id: "3", rating: 1500 },
    ],
    legends: [],
    weapons: [
        {
            playerId: "1",
            weapon: "Sword",
            games: 100,
            wins: 60,
            damageDealt: 30_000,
            kos: 90,
            matchTime: 6_000,
        },
        {
            playerId: "1",
            weapon: "Axe",
            games: 40,
            wins: 10,
            damageDealt: 12_000,
            kos: 30,
            matchTime: 2_400,
        },
        {
            playerId: "2",
            weapon: "Sword",
            games: 10,
            wins: 5,
            damageDealt: 3_000,
            kos: 9,
            matchTime: 600,
        },
        {
            playerId: "3",
            weapon: "Bow",
            games: 0,
            wins: 0,
            damageDealt: 0,
            kos: 0,
            matchTime: 0,
        },
    ],
}

describe("getWeaponMeta", () => {
    it.effect("sums games, wins, damage, time and KOs per weapon", () =>
        Effect.gen(function* () {
            const sample = yield* readWeaponMeta(weaponSample)

            expect(sample.rows).toEqual([
                {
                    weapon: "Axe",
                    games: 40,
                    wins: 10,
                    accounts: 1,
                    damageDealt: 12_000,
                    matchTime: 2_400,
                    kos: 30,
                },
                {
                    weapon: "Sword",
                    games: 110,
                    wins: 65,
                    accounts: 2,
                    damageDealt: 33_000,
                    matchTime: 6_600,
                    kos: 99,
                },
            ])
        }),
    )

    it.effect("omits a weapon with no indexed games", () =>
        Effect.gen(function* () {
            const sample = yield* readWeaponMeta(weaponSample)

            expect(sample.rows.map((row) => row.weapon)).not.toContain("Bow")
        }),
    )

    it.effect("counts every indexed account as the sample size", () =>
        Effect.gen(function* () {
            expect((yield* readWeaponMeta(weaponSample)).accounts).toBe(3)
        }),
    )

    it.effect("reads an empty archive as an empty sample", () =>
        Effect.gen(function* () {
            expect(
                yield* readWeaponMeta({ accounts: [], legends: [] }),
            ).toEqual({ rows: [], accounts: 0 })
        }),
    )
})
