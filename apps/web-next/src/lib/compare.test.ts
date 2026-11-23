import { describe, expect, it } from "@effect/vitest"
import { comparePlayers } from "./compare"
import type { ComparisonRow } from "./compare"
import type { PlayerProfile, PlayerRanked } from "@crh/api-contract/schemas"

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
    weapon_kos: 13_400,
    thrown_kos: 420,
    weapon_damage: 1_910_000,
    ...overrides,
})

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
