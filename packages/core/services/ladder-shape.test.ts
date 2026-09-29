import { describe, expect, it } from "@effect/vitest"
import { isCompleteLeaderboard, toRankings3v3 } from "./upstream/v1"
import type { V1Leaderboard } from "./upstream/v1"

/**
 * The 3v3 ladder's shape, pinned to a real payload.
 *
 * This exists because the first implementation modelled a 3v3 row as a trio —
 * three ids and a `teamname`, like 2v2 — and the ladder silently returned an
 * empty list in production. The cause was the completeness predicate: it
 * required three players per row, every real row has one, so every page was
 * rejected and the v1-only path turned that into `[]` with an HTTP 200.
 *
 * The payloads below are trimmed copies of responses from
 * `https://api.brawlhalla.com/v1/leaderboard/ranked`. They are the reason the
 * mode's real shape is what the code is written against rather than what its
 * name suggests: 3v3 is a solo queue whose teams are assembled per match, so its
 * ladder looks exactly like 1v1.
 */

/** Verbatim shape from `game_mode=3v3&region=ALL&page=1`. */
const threeVsThree: V1Leaderboard = {
    total_pages: 12,
    rankings: [
        {
            players: [{ id: 78717735, username: "☩ Pinocchio ☩" }],
            best_rating: 2083,
            rank: 1,
            rating: 2083,
            wins: 28,
            losses: 1,
            region: "EU",
            tier: "Diamond",
        },
        {
            players: [{ id: 25475700, username: "yurikoღ" }],
            best_rating: 2081,
            rank: 3,
            rating: 2081,
            wins: 31,
            losses: 4,
            region: "EU",
            tier: "Diamond",
        },
    ],
}

/** Verbatim shape from `game_mode=2v2&region=ALL&page=1`, for contrast. */
const twoVsTwo: V1Leaderboard = {
    total_pages: 20,
    rankings: [
        {
            players: [
                { id: 1, username: "first" },
                { id: 2, username: "second" },
            ],
            best_rating: 2500,
            rank: 1,
            rating: 2500,
            wins: 40,
            losses: 5,
            region: "US-E",
            tier: "Valhallan",
        },
    ],
}

describe("3v3 ladder shape", () => {
    it("accepts a page whose rows carry one player", () => {
        // The regression: requiring three players per row rejected every real
        // page.
        expect(isCompleteLeaderboard(threeVsThree, 1)).toBe(true)
        expect(isCompleteLeaderboard(threeVsThree, 3)).toBe(false)
    })

    it("does not confuse 2v2 with 3v3", () => {
        expect(isCompleteLeaderboard(twoVsTwo, 2)).toBe(true)
        expect(isCompleteLeaderboard(twoVsTwo, 1)).toBe(false)
    })

    it("maps a row to a single-player ranking, not a team row", () => {
        const rows = toRankings3v3(threeVsThree.rankings)

        expect(rows).toHaveLength(2)
        expect(rows[0]).toMatchObject({
            rank: 1,
            rating: 2083,
            peak_rating: 2083,
            tier: "Diamond",
            name: "☩ Pinocchio ☩",
            brawlhalla_id: 78717735,
        })
    })

    it("derives games from wins and losses, which v1 does not send", () => {
        const rows = toRankings3v3(threeVsThree.rankings)

        expect(rows[0]?.games).toBe(29)
        expect(rows[0]?.wins).toBe(28)
    })

    it("lowercases the region code", () => {
        // v1 sends `EU`; the app stores and compares lowercase.
        expect(toRankings3v3(threeVsThree.rankings)[0]?.region).toBe("eu")
    })

    it("keeps its rank numbers faithful, holes included", () => {
        // The second row is rank 3, not 2 — the ladder's own numbering must
        // survive the mapping rather than being re-indexed.
        expect(toRankings3v3(threeVsThree.rankings)[1]?.rank).toBe(3)
    })
})
