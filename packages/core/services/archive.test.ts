import { DatabaseSync } from "node:sqlite"
import { Effect } from "effect"
import { describe, expect, it } from "@effect/vitest"
import { buildLegendMeta } from "@crh/domain/aggregate/meta"
import { Database, makeLayer, topPercent } from "./archive"
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
    `)

    const insertAccount = sqlite.prepare(
        `INSERT INTO "BHPlayerData" ("id", "rating") VALUES (?, ?)`,
    )
    const insertLegend = sqlite.prepare(
        `INSERT INTO "BHPlayerLegend" ("player_id", "legend_id", "games", "wins")
         VALUES (?, ?, ?, ?)`,
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

type GuildRow = {
    readonly id: string
    readonly name: string
    readonly xp: number
}

const guildLayerFor = (guilds: readonly GuildRow[]) => {
    const sqlite = new DatabaseSync(":memory:")

    sqlite.exec(`
        CREATE TABLE "BHClan" (
            "id" TEXT PRIMARY KEY,
            "name" TEXT NOT NULL,
            "nameLower" TEXT NOT NULL DEFAULT '',
            "created" INTEGER DEFAULT -1,
            "xp" INTEGER NOT NULL
        );
    `)

    const insertGuild = sqlite.prepare(
        `INSERT INTO "BHClan" ("id", "name", "nameLower", "xp") VALUES (?, ?, ?, ?)`,
    )

    for (const guild of guilds) {
        insertGuild.run(
            guild.id,
            guild.name,
            guild.name.toLowerCase(),
            guild.xp,
        )
    }

    return makeLayer(toD1(sqlite))
}

const readStanding = (guilds: readonly GuildRow[], clanId: string) =>
    Effect.gen(function* () {
        const db = yield* Database

        return yield* db.getGuildStanding(clanId)
    }).pipe(Effect.provide(guildLayerFor(guilds)))

describe("getGuildStanding", () => {
    it.effect("ranks a guild by XP from the top of the table", () =>
        Effect.gen(function* () {
            const standings = yield* readStanding(
                [
                    { id: "1", name: "First", xp: 900 },
                    { id: "2", name: "Second", xp: 600 },
                    { id: "3", name: "Third", xp: 300 },
                ],
                "2",
            )

            expect(standings).toEqual({ rank: 2, total: 3 })
        }),
    )

    it.effect("gives tied guilds the higher position", () =>
        Effect.gen(function* () {
            const guilds: readonly GuildRow[] = [
                { id: "1", name: "Tied A", xp: 900 },
                { id: "2", name: "Tied B", xp: 900 },
                { id: "3", name: "Behind", xp: 100 },
            ]

            expect(yield* readStanding(guilds, "1")).toEqual({
                rank: 1,
                total: 3,
            })
            expect(yield* readStanding(guilds, "2")).toEqual({
                rank: 1,
                total: 3,
            })
            expect(yield* readStanding(guilds, "3")).toEqual({
                rank: 3,
                total: 3,
            })
        }),
    )

    it.effect("has no rank for a guild the archive has never indexed", () =>
        Effect.gen(function* () {
            const standings = yield* readStanding(
                [
                    { id: "1", name: "Indexed", xp: 900 },
                    { id: "2", name: "Also indexed", xp: 500 },
                ],
                "999",
            )

            expect(standings).toEqual({ rank: null, total: 2 })
        }),
    )
})

type RankedRow = {
    readonly id: string
    readonly rating: number
    readonly rankedGames: number
}

const rankedLayerFor = (rows: readonly RankedRow[]) => {
    const sqlite = new DatabaseSync(":memory:")

    sqlite.exec(`
        CREATE TABLE "BHPlayerData" (
            "id" TEXT PRIMARY KEY,
            "rating" INTEGER NOT NULL,
            "rankedGames" INTEGER NOT NULL
        );
    `)

    const insert = sqlite.prepare(
        `INSERT INTO "BHPlayerData" ("id", "rating", "rankedGames") VALUES (?, ?, ?)`,
    )

    for (const row of rows) insert.run(row.id, row.rating, row.rankedGames)

    return makeLayer(toD1(sqlite))
}

const readRankedStanding = (rows: readonly RankedRow[], playerId: string) =>
    Effect.gen(function* () {
        const db = yield* Database

        return yield* db.getRankedStanding(playerId)
    }).pipe(Effect.provide(rankedLayerFor(rows)))

describe("getRankedStanding", () => {
    it.effect("counts the players ahead and the indexed ranked sample", () =>
        Effect.gen(function* () {
            const standing = yield* readRankedStanding(
                [
                    { id: "1", rating: 2400, rankedGames: 80 },
                    { id: "2", rating: 2200, rankedGames: 12 },
                    { id: "3", rating: 2000, rankedGames: 40 },
                    { id: "4", rating: 1800, rankedGames: 5 },
                ],
                "3",
            )

            expect(standing).toEqual({
                rank: 3,
                sample_size: 4,
                top_percent: 75,
            })
        }),
    )

    it.effect("gives equal ratings the same rank", () =>
        Effect.gen(function* () {
            const rows: readonly RankedRow[] = [
                { id: "1", rating: 2200, rankedGames: 30 },
                { id: "2", rating: 2200, rankedGames: 20 },
                { id: "3", rating: 2000, rankedGames: 10 },
            ]

            expect(yield* readRankedStanding(rows, "1")).toEqual({
                rank: 1,
                sample_size: 3,
                top_percent: 33.3,
            })
            expect(yield* readRankedStanding(rows, "2")).toEqual({
                rank: 1,
                sample_size: 3,
                top_percent: 33.3,
            })
            expect(yield* readRankedStanding(rows, "3")).toEqual({
                rank: 3,
                sample_size: 3,
                top_percent: 100,
            })
        }),
    )

    it.effect("excludes players with no ranked game", () =>
        Effect.gen(function* () {
            const standing = yield* readRankedStanding(
                [
                    { id: "1", rating: 2600, rankedGames: 0 },
                    { id: "2", rating: 2000, rankedGames: 10 },
                    { id: "3", rating: 1800, rankedGames: 3 },
                ],
                "2",
            )

            expect(standing).toEqual({
                rank: 1,
                sample_size: 2,
                top_percent: 50,
            })
        }),
    )

    it.effect("has no standing for a player the archive never indexed", () =>
        Effect.gen(function* () {
            const standing = yield* readRankedStanding(
                [
                    { id: "1", rating: 2000, rankedGames: 10 },
                    { id: "2", rating: 1800, rankedGames: 3 },
                ],
                "999",
            )

            expect(standing).toBeNull()
        }),
    )

    it.effect("has no standing for an unranked player in the archive", () =>
        Effect.gen(function* () {
            const standing = yield* readRankedStanding(
                [{ id: "1", rating: 0, rankedGames: 0 }],
                "1",
            )

            expect(standing).toBeNull()
        }),
    )
})

describe("topPercent", () => {
    it("rounds to one decimal", () => {
        expect(topPercent(4182, 214_300)).toBe(2)
        expect(topPercent(2, 3)).toBe(66.7)
    })

    it("floors the top of a large field at 0.1", () => {
        expect(topPercent(7, 214_300)).toBe(0.1)
    })

    it("gives rank 1 of a one-player sample the whole field", () => {
        expect(topPercent(1, 1)).toBe(100)
    })
})
