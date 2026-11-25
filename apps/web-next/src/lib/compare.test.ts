import { describe, expect, it } from "@effect/vitest"
import {
    SHARED_LEGEND_LIMIT,
    comparePlayers,
    legendWinRate,
    sharedLegends,
} from "./compare"
import type { ComparisonRow } from "./compare"
import type {
    LegendBubble,
    PlayerProfile,
    PlayerRanked,
} from "@crh/api-contract/schemas"

const bracket = (
    overrides: Partial<NonNullable<PlayerRanked["1v1"]>> = {},
): NonNullable<PlayerRanked["1v1"]> => ({
    rating: 1988,
    peak_rating: 2104,
    is_placement_matches: false,
    tier: "Diamond",
    wins: 214,
    games: 362,
    region: "eu",
    global_rank: null,
    region_rank: null,
    rating_reset: 1950,
    ...overrides,
})

const ranked = (overrides: Partial<PlayerRanked> = {}): PlayerRanked => ({
    stats: {
        games: 362,
        wins: 214,
        peak_rating: 2104,
        glory: { from_wins: 1200, from_peak_rating: 900, total: 2100 },
    },
    "1v1": bracket(),
    "2v2": null,
    "3v3": null,
    ...overrides,
})

const stats = (
    overrides: Partial<PlayerProfile["stats"]> = {},
): PlayerProfile["stats"] => ({
    xp: 12_400_000,
    level: 84,
    xp_percentage: 41,
    games: 8_420,
    wins: 4_910,
    matchtime: 984_000,
    kos: 31_200,
    falls: 27_400,
    suicides: 820,
    team_kos: 410,
    damage_dealt: 8_120_000,
    damage_taken: 7_640_000,
    ...overrides,
})

const profile = (overrides: Partial<PlayerProfile> = {}): PlayerProfile => ({
    id: 1,
    name: "Mordex",
    slug: "1-mordex",
    aliases: [],
    stats: stats(),
    ranked: ranked(),
    unarmed: { damage_dealt: 320_000, kos: 2_400, time_held: 190_000 },
    weapon_throws: { damage_dealt: 88_000, kos: 0 },
    gadgets: {
        kos: 1_100,
        damage_dealt: 210_000,
        bomb: null,
        mine: null,
        spikeball: null,
        sidekick: null,
        snowball: null,
    },
    legend_bubbles: [],
    weapon_bubbles: [],
    has_2v2: false,
    solo_2v2: null,
    standing: null,
    weapon_kos: 13_400,
    thrown_kos: 420,
    weapon_damage: 1_910_000,
    ...overrides,
})

const bubble = (overrides: Partial<LegendBubble> = {}): LegendBubble => ({
    id: 12,
    name: "Mordex",
    name_key: "Mordex",
    slug: "12-mordex",
    level: 78,
    matchtime: 984_000,
    kos: 24_600,
    damage_dealt: 3_410_000,
    games: 3_820,
    wins: 2_270,
    ...overrides,
})

const pool = (
    count: number,
    games: (index: number) => number,
): readonly LegendBubble[] =>
    Array.from({ length: count }, (_, index) =>
        bubble({
            id: index + 1,
            name: `Legend ${index + 1}`,
            name_key: `legend ${index + 1}`,
            slug: `${index + 1}-legend-${index + 1}`,
            games: games(index),
        }),
    )

const row = (rows: readonly ComparisonRow[], label: string): ComparisonRow => {
    const found = rows.find((entry) => entry.label === label)

    if (found === undefined) throw new Error(`no "${label}" row`)

    return found
}

describe("comparePlayers", () => {
    it("marks the higher side on a higher-is-better row", () => {
        const rows = comparePlayers(
            profile(),
            profile({ stats: stats({ level: 60 }) }),
        )

        expect(row(rows, "Account level")).toEqual({
            label: "Account level",
            a: "84",
            b: "60",
            winner: "a",
        })
    })

    it("marks the lower side on a lower-is-better row", () => {
        const rows = comparePlayers(
            profile(),
            profile({ stats: stats({ falls: 8_420 }) }),
        )

        expect(row(rows, "Falls per game")).toMatchObject({
            a: "3.3",
            b: "1.0",
            winner: "b",
        })
    })

    it("places tiers by ladder order, not by label text", () => {
        // "Gold 5" sorts before "Platinum 3" alphabetically but ranks below it.
        const rows = comparePlayers(
            profile({ ranked: ranked({ "1v1": bracket({ tier: "Gold 5" }) }) }),
            profile({
                ranked: ranked({ "1v1": bracket({ tier: "Platinum 3" }) }),
            }),
        )

        expect(row(rows, "1v1 tier")).toMatchObject({
            a: "Gold 5",
            b: "Platinum 3",
            winner: "b",
        })
    })

    it("leaves equal values without a winner", () => {
        const rows = comparePlayers(profile(), profile())

        expect(row(rows, "KOs")).toEqual({
            label: "KOs",
            a: "31,200",
            b: "31,200",
            winner: null,
        })
    })

    it("dashes the ranked rows and picks no winner when neither player placed", () => {
        const rows = comparePlayers(
            profile({ ranked: null }),
            profile({ ranked: null }),
        )

        const rankedLabels = [
            "1v1 rating",
            "1v1 peak",
            "1v1 tier",
            "Season games",
            "Season win rate",
            "Season glory total",
            "1v1 Elo reset",
        ]

        for (const label of rankedLabels) {
            expect(row(rows, label)).toEqual({
                label,
                a: "—",
                b: "—",
                winner: null,
            })
        }
    })

    it("dashes the rates of a player with no career games instead of reading zero", () => {
        const unplayed = profile({
            stats: stats({
                games: 0,
                wins: 0,
                kos: 0,
                falls: 0,
                damage_dealt: 0,
            }),
        })

        const rows = comparePlayers(unplayed, profile())

        for (const label of [
            "Career win rate",
            "KOs per game",
            "Damage dealt per game",
            "Falls per game",
        ]) {
            expect(row(rows, label)).toMatchObject({
                a: "—",
                winner: "b",
            })
        }

        expect(row(rows, "Career games")).toMatchObject({
            a: "0",
            winner: "b",
        })
    })

    it("leaves both unplayed sides without a winner on the rate rows", () => {
        const unplayed = profile({
            stats: stats({
                games: 0,
                wins: 0,
                kos: 0,
                falls: 0,
                damage_dealt: 0,
            }),
        })

        const rows = comparePlayers(unplayed, unplayed)

        for (const label of [
            "Career win rate",
            "KOs per game",
            "Damage dealt per game",
            "Falls per game",
        ]) {
            expect(row(rows, label)).toEqual({
                label,
                a: "—",
                b: "—",
                winner: null,
            })
        }
    })

    it("marks the ranked side when only one player placed", () => {
        const rows = comparePlayers(profile({ ranked: null }), profile())

        expect(row(rows, "1v1 rating")).toMatchObject({
            a: "—",
            b: "1,988",
            winner: "b",
        })
    })

    it("keeps the row order stable", () => {
        expect(
            comparePlayers(profile(), profile()).map((entry) => entry.label),
        ).toEqual([
            "Account level",
            "Account XP",
            "Career games",
            "Career win rate",
            "KOs",
            "KOs per game",
            "Damage dealt per game",
            "Falls per game",
            "1v1 rating",
            "1v1 peak",
            "1v1 tier",
            "Season games",
            "Season win rate",
            "Season glory total",
            "1v1 Elo reset",
        ])
    })

    it("produces no winners for identical profiles", () => {
        const rows = comparePlayers(profile(), profile())

        expect(rows.filter((entry) => entry.winner !== null)).toEqual([])
    })
})

describe("sharedLegends", () => {
    it("keeps only the legends both players have played", () => {
        const { rows } = sharedLegends(
            profile({
                legend_bubbles: [
                    bubble(),
                    bubble({ id: 34, name: "Ragnir", name_key: "Ragnir" }),
                ],
            }),
            profile({
                legend_bubbles: [
                    bubble(),
                    bubble({
                        id: 99,
                        name: "Queen Nai",
                        name_key: "Queen Nai",
                    }),
                ],
            }),
        )

        expect(rows.map((entry) => entry.name)).toEqual(["Mordex"])
    })

    it("carries each side's games, wins and level", () => {
        const { rows } = sharedLegends(
            profile({ legend_bubbles: [bubble()] }),
            profile({
                legend_bubbles: [
                    bubble({ games: 1_528, wins: 764, level: 42 }),
                ],
            }),
        )

        expect(rows[0]?.a).toEqual({ games: 3_820, wins: 2_270, level: 78 })
        expect(rows[0]?.b).toEqual({ games: 1_528, wins: 764, level: 42 })
    })

    it("orders by combined games across both profiles", () => {
        const { rows } = sharedLegends(
            profile({
                legend_bubbles: [
                    bubble({ id: 34, name: "Ragnir", games: 100, wins: 50 }),
                    bubble({ id: 12, name: "Mordex", games: 40, wins: 20 }),
                    bubble({
                        id: 99,
                        name: "Queen Nai",
                        games: 500,
                        wins: 250,
                    }),
                ],
            }),
            profile({
                legend_bubbles: [
                    bubble({ id: 34, name: "Ragnir", games: 300, wins: 150 }),
                    bubble({ id: 12, name: "Mordex", games: 10, wins: 5 }),
                    bubble({ id: 99, name: "Queen Nai", games: 20, wins: 10 }),
                ],
            }),
        )

        expect(rows.map((entry) => entry.name)).toEqual([
            "Queen Nai",
            "Ragnir",
            "Mordex",
        ])
    })

    it("caps the list and reports how many legends the cap hides", () => {
        const { rows, hidden } = sharedLegends(
            profile({ legend_bubbles: pool(12, (index) => (index + 1) * 10) }),
            profile({ legend_bubbles: pool(12, () => 1) }),
        )

        expect(rows).toHaveLength(SHARED_LEGEND_LIMIT)
        expect(hidden).toBe(12 - SHARED_LEGEND_LIMIT)
        expect(rows[0]?.name).toBe("Legend 12")
        expect(rows.at(-1)?.name).toBe("Legend 3")
    })

    it("reports nothing hidden when the overlap fits under the cap", () => {
        const { hidden } = sharedLegends(
            profile({ legend_bubbles: [bubble()] }),
            profile({ legend_bubbles: [bubble()] }),
        )

        expect(hidden).toBe(0)
    })

    it("drops a legend either side has not played", () => {
        const { rows, hidden } = sharedLegends(
            profile({
                legend_bubbles: [
                    bubble({ id: 34, name: "Ragnir", games: 0, wins: 0 }),
                    bubble(),
                ],
            }),
            profile({
                legend_bubbles: [
                    bubble(),
                    bubble({ id: 34, name: "Ragnir", games: 200, wins: 100 }),
                    bubble({
                        id: 99,
                        name: "Queen Nai",
                        games: 400,
                        wins: 200,
                    }),
                ],
            }),
        )

        expect(rows.map((entry) => entry.name)).toEqual(["Mordex"])
        expect(hidden).toBe(0)
    })

    it("returns no rows when neither player has a legend pool", () => {
        const { rows, hidden } = sharedLegends(profile(), profile())

        expect(rows).toEqual([])
        expect(hidden).toBe(0)
    })
})

describe("legendWinRate", () => {
    it("derives the rate from that side's wins and games", () => {
        expect(legendWinRate({ games: 3_820, wins: 2_270, level: 78 })).toBe(
            "59.42%",
        )
        expect(legendWinRate({ games: 1_528, wins: 764, level: 42 })).toBe(
            "50.00%",
        )
    })

    it("dashes an unplayed side instead of reading zero", () => {
        expect(legendWinRate({ games: 0, wins: 0, level: 1 })).toBe("—")
    })
})
