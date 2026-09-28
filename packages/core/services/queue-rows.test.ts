import { describe, expect, it } from "vitest"
import { toRankedQueueRows } from "./player-writes"
import type { Ranking1v1, Ranking2v2, Ranking3v3 } from "@crh/bhapi/types"

/**
 * A ladder page as queue rows.
 *
 * The queue is keyed by (player, bracket) but a 2v2 ladder row carries a *team*
 * — two players and one shared game count — so the mapping has real decisions
 * in it rather than being a rename. Getting one wrong is quiet: the row still
 * writes, and the queue simply reports the wrong people, or reports the same
 * person as having played when a quieter team of theirs was sampled.
 */

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
            // Placeholders: the real deltas are computed in SQL against the
            // row's previous values, which the mapper never sees.
            ratingDelta: 0,
            rankDelta: 0,
        })
    })

    /*
     * Whether the player queued is decided in SQL, by comparing this row's
     * `games` against the stored one. Setting it here would announce every
     * first observation as activity.
     */
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
        // The zero id is Brawlhalla's "no player" sentinel. The row is the
        // player's own solo record rather than a pairing, so there is no team
        // to track and nothing to report.
        const rows = toRankedQueueRows(
            "2v2",
            "eu",
            [team(9, 0, 12, "Lonely")],
            seenAt,
        )

        expect(rows).toHaveLength(0)
    })

    /*
     * A player can hold several teams near the top of the 2v2 ladder. Each is
     * its own entry with its own count, and none of them can be mistaken for
     * another — which is the whole reason the queue is keyed by team rather
     * than by player. Under a player key these two rows collided, and which
     * count survived depended on the order the pages were sampled.
     */
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
