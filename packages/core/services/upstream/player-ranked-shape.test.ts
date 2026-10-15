import { describe, expect, it } from "vitest"
import { toPlayerRanked } from "./v1"
import type { V1PlayerRankedStats, V1PlayerTeams } from "./v1"

const rankedStats: V1PlayerRankedStats = {
    brawlhalla_id: 4697805,
    name: "Octavius",
    games: 90,
    wins: 50,
    rating: 1618,
    peak_rating: 1705,
    tier: "Gold 4",
    region: "US-E",
    region_ranks: [{ region: "US-E", rank: 64491 }],
    global_rank: 195136,
    legends: [
        {
            legend_id: 3,
            games: 40,
            wins: 25,
            rating: 1600,
            peak_rating: 1650,
            tier: "Gold 4",
        },
    ],
}

const teams: V1PlayerTeams = {
    brawlhalla_id: 4697805,
    teams: {
        ranked_2v2: [
            {
                brawlhalla_id_one: 4697805,
                brawlhalla_id_two: 2467374,
                username_one: "Octavius",
                username_two: "UpyriDensetsu",
                rating: 1618,
                peak_rating: 1705,
                tier: "Gold 4",
                wins: 41,
                games: 87,
                region: "US-E",
                global_rank: 195136,
            },
        ],
    },
}

describe("toPlayerRanked", () => {
    it("carries the account record through", () => {
        const ranked = toPlayerRanked(rankedStats, teams)

        expect(ranked).toMatchObject({
            name: "Octavius",
            brawlhalla_id: 4697805,
            rating: 1618,
            peak_rating: 1705,
            tier: "Gold 4",
            wins: 50,
            games: 90,
            region: "us-e",
            global_rank: 195136,
        })
    })

    it("maps the ranked legend, naming it from the legend table", () => {
        const legend = toPlayerRanked(rankedStats, teams)?.legends[0]

        expect(legend).toMatchObject({
            legend_id: 3,
            rating: 1600,
            peak_rating: 1650,
            tier: "Gold 4",
            wins: 25,
            games: 40,
        })
        expect(legend?.legend_name_key.length).toBeGreaterThan(0)
    })

    it("lifts the 2v2 team from /player/teams into the v0 team shape", () => {
        const team = toPlayerRanked(rankedStats, teams)?.["2v2"][0]

        expect(team).toMatchObject({
            brawlhalla_id_one: 4697805,
            brawlhalla_id_two: 2467374,
            name_one: "Octavius",
            name_two: "UpyriDensetsu",
            teamname: "Octavius+UpyriDensetsu",
            rating: 1618,
            peak_rating: 1705,
            wins: 41,
            games: 87,
            // Numeric region index: `rankedRegions[2 - 1]` is "us-e".
            region: 2,
        })
    })

    it("treats a null team tier as Valhallan", () => {
        const valhallan: V1PlayerTeams = {
            ...teams,
            teams: {
                ranked_2v2: [{ ...teams.teams.ranked_2v2[0]!, tier: null }],
            },
        }

        expect(toPlayerRanked(rankedStats, valhallan)?.["2v2"][0]?.tier).toBe(
            "Valhallan",
        )
    })

    it("returns no teams when /player/teams yields nothing", () => {
        expect(toPlayerRanked(rankedStats, null)?.["2v2"]).toEqual([])
    })

    it("builds a 2v2-only record when the account has no placed 1v1", () => {
        const ranked = toPlayerRanked(null, teams)

        expect(ranked).toMatchObject({
            name: "Octavius",
            brawlhalla_id: 4697805,
            rating: 0,
            region: "us-e",
        })
        expect(ranked?.["2v2"]).toHaveLength(1)
    })

    it("still carries teams when the account record is unranked", () => {
        const ranked = toPlayerRanked({ ...rankedStats, rating: null }, teams)

        expect(ranked?.rating).toBe(0)
        expect(ranked?.["2v2"]).toHaveLength(1)
    })

    it("returns null when there is neither account nor teams", () => {
        expect(toPlayerRanked(null, null)).toBeNull()
    })
})
