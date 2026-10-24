import { describe, expect, it } from "@effect/vitest"
import { isCompleteLeaderboard, toRankings3v3 } from "@crh/domain/upstream/v1"
import type { V1Leaderboard } from "@crh/domain/upstream/v1"

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
        expect(isCompleteLeaderboard(threeVsThree, 1)).toBe(true)
        expect(isCompleteLeaderboard(threeVsThree, 3)).toBe(false)
    })

    it("does not confuse 2v2 with 3v3", () => {
        expect(isCompleteLeaderboard(twoVsTwo, 2)).toBe(true)
        expect(isCompleteLeaderboard(twoVsTwo, 1)).toBe(false)
    })

    it("accepts a Valhallan row, whose v1 tier is null", () => {
        const valhallan: V1Leaderboard = {
            ...threeVsThree,
            rankings: [{ ...threeVsThree.rankings[0]!, tier: null }],
        }

        expect(isCompleteLeaderboard(valhallan, 1)).toBe(true)
    })

    it("renders a null tier as Valhallan rather than dropping the row", () => {
        const rows = toRankings3v3([
            { ...threeVsThree.rankings[0]!, tier: null },
        ])

        expect(rows[0]?.tier).toBe("Valhallan")
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
        expect(toRankings3v3(threeVsThree.rankings)[1]?.rank).toBe(3)
    })
})
