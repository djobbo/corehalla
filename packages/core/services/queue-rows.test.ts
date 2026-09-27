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
            player_id: "7",
            bracket: "1v1",
            region: "eu",
            name: "Seven",
            rating: 2000,
            peakRating: 2100,
            tier: "Diamond",
            games: 42,
            wins: 37,
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

    it("splits a 2v2 team into one row per player", () => {
        const rows = toRankedQueueRows(
            "2v2",
            "eu",
            [team(1, 2, 30, "Alpha+Beta")],
            seenAt,
        )

        expect(rows).toHaveLength(2)
        expect(rows.map((row) => [row.player_id, row.name])).toEqual([
            ["1", "Alpha"],
            ["2", "Beta"],
        ])
        // The team's count is copied, not divided: the question the column
        // answers is "did this player's team play", and both did.
        expect(rows.every((row) => row.games === 30)).toBe(true)
    })

    it("drops the zero id a solo-queue 2v2 row carries", () => {
        const rows = toRankedQueueRows(
            "2v2",
            "eu",
            [team(9, 0, 12, "Lonely")],
            seenAt,
        )

        expect(rows).toHaveLength(1)
        expect(rows[0]?.player_id).toBe("9")
    })

    /*
     * A player can hold more than one team near the top of the 2v2 ladder, so
     * the page can carry their key twice. Keeping the largest count is what
     * makes the stored figure monotonic — without it, a quieter team sampled
     * after a busier one would *lower* `games`, and the next real game would
     * look like the player returning from an absence.
     */
    it("keeps the largest game count when a player appears twice", () => {
        const rows = toRankedQueueRows(
            "2v2",
            "eu",
            [team(1, 2, 10, "Alpha+Beta"), team(1, 3, 400, "Alpha+Gamma")],
            seenAt,
        )

        const alpha = rows.filter((row) => row.player_id === "1")

        expect(alpha).toHaveLength(1)
        expect(alpha[0]?.games).toBe(400)
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

        expect(rows.map((row) => row.player_id)).toEqual(["5"])
        expect(rows[0]?.bracket).toBe("3v3")
        expect(rows[0]?.region).toBe("brz")
    })
})
