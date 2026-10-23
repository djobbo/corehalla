import { describe, expect, it } from "vitest"
import { toRankedQueueRows } from "./player-writes"
import type { Ranking1v1, Ranking2v2, Ranking3v3 } from "@crh/bhapi/types"

const seenAt = new Date("2026-01-01T00:00:00Z")

const solo = (id: number, name: string, games: number): Ranking1v1 => ({
    rank: 1,
    rating: 2000,
    peak_rating: 2100,
    tier: "Diamond",
    games,
    wins: games - 5,
    region: "eu",
    name,
    brawlhalla_id: id,
    best_legend: 0,
    best_legend_games: 0,
    best_legend_wins: 0,
})

const team = (
    one: number,
    two: number,
    games: number,
    teamname: string,
): Ranking2v2 => ({
    rank: 1,
    rating: 1900,
    peak_rating: 1950,
    tier: "Platinum 5",
    games,
    wins: games - 4,
    region: "eu",
    name_one: teamname.split("+")[0] ?? "",
    name_two: teamname.split("+")[1] ?? "",
    teamname,
    brawlhalla_id_one: one,
    brawlhalla_id_two: two,
})

describe("toRankedQueueRows", () => {
    it("carries the ladder figures onto the row", () => {
        const [row] = toRankedQueueRows(
            "1v1",
            "eu",
            [solo(7, "Seven", 42)],
            seenAt,
        )

        expect(row).toMatchObject({
            entry_id: "7",
            bracket: "1v1",
            region: "eu",
            name_one: "Seven",
            name_two: null,
            rating: 2000,
            peakRating: 2100,
            tier: "Diamond",
            games: 42,
            wins: 37,
            rank: 1,
            ratingDelta: 0,
            rankDelta: 0,
        })
    })

    it("never stamps queuedAt itself", () => {
        const rows = toRankedQueueRows(
            "1v1",
            "eu",
            [solo(7, "Seven", 42)],
            seenAt,
        )

        expect(rows[0]?.queuedAt).toBeNull()
    })

    it("emits one row per team, keyed by the pair", () => {
        const rows = toRankedQueueRows(
            "2v2",
            "eu",
            [team(1, 2, 30, "Alpha+Beta")],
            seenAt,
        )

        expect(rows).toHaveLength(1)
        expect(rows[0]).toMatchObject({
            entry_id: "1-2",
            name_one: "Alpha",
            name_two: "Beta",
            member_one_id: "1",
            member_two_id: "2",
            games: 30,
        })
    })

    it("drops a solo-queue 2v2 row, which is not a team", () => {
        const rows = toRankedQueueRows(
            "2v2",
            "eu",
            [team(9, 0, 12, "Lonely")],
            seenAt,
        )

        expect(rows).toHaveLength(0)
    })

    it("keeps a player's two teams as separate entries", () => {
        const rows = toRankedQueueRows(
            "2v2",
            "eu",
            [team(1, 2, 10, "Alpha+Beta"), team(1, 3, 400, "Alpha+Gamma")],
            seenAt,
        )

        expect(rows.map((row) => [row.entry_id, row.games])).toEqual([
            ["1-2", 10],
            ["1-3", 400],
        ])
    })

    it("drops the zero id a 3v3 row would carry, and keeps real ones", () => {
        const rows = toRankedQueueRows(
            "3v3",
            "brz",
            [
                { ...solo(5, "Five", 9), rank: 1 } as Ranking3v3,
                { ...solo(0, "Nobody", 9), rank: 2 } as Ranking3v3,
            ],
            seenAt,
        )

        expect(rows.map((row) => row.entry_id)).toEqual(["5"])
        expect(rows[0]?.bracket).toBe("3v3")
        expect(rows[0]?.region).toBe("brz")
    })
})
