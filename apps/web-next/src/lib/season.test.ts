import { describe, expect, it } from "@effect/vitest"
import { eloReset, rankedBracketState, seasonGlory } from "./season"
import type { PlayerRanked } from "@crh/api-contract/schemas"

type Bracket = NonNullable<PlayerRanked["1v1"]>

const bracket = (ratingReset: number): Bracket => ({
    rating: ratingReset + 38,
    peak_rating: ratingReset + 120,
    is_placement_matches: false,
    tier: "Diamond",
    wins: 214,
    games: 362,
    region: "eu",
    global_rank: null,
    region_rank: null,
    rating_reset: ratingReset,
})

const rankedSeason = ({
    games,
    wins = 214,
    peakRating = 2104,
    glory = { from_wins: 1200, from_peak_rating: 900, total: 2100 },
    oneVsOne = bracket(1950),
}: {
    readonly games: number
    readonly wins?: number
    readonly peakRating?: number
    readonly glory?: PlayerRanked["stats"]["glory"]
    readonly oneVsOne?: Bracket | null
}): PlayerRanked => ({
    stats: { games, wins, peak_rating: peakRating, glory },
    "1v1": oneVsOne,
    "2v2": null,
    "3v3": null,
})

describe("seasonGlory", () => {
    it("reports nine ranked games as insufficient, naming the threshold", () => {
        expect(seasonGlory(rankedSeason({ games: 9 }))).toEqual({
            kind: "insufficient",
            games: 9,
            required: 10,
        })
    })

    it("awards at exactly ten ranked games", () => {
        expect(seasonGlory(rankedSeason({ games: 10 }))).toMatchObject({
            kind: "awarded",
        })
    })

    it("passes the payload glory through unchanged instead of recomputing it", () => {
        // 214 wins would earn a different number; the payload value must win.
        expect(seasonGlory(rankedSeason({ games: 362 }))).toEqual({
            kind: "awarded",
            total: 2100,
            fromWins: 1200,
            fromRating: 900,
            bestRating: 2104,
        })
    })
})

describe("rankedBracketState", () => {
    it("reports placements for a bracket whose rating placements still hide", () => {
        // The domain writes a Valhallan name over an unplaced bracket; the flag wins.
        const placement = {
            ...bracket(0),
            rating: 0,
            peak_rating: 0,
            is_placement_matches: true,
            tier: "Valhallan",
            wins: 4,
            games: 9,
        }

        expect(rankedBracketState(placement)).toEqual({ kind: "placements" })
    })

    it("reports the tier of a placed bracket", () => {
        expect(rankedBracketState(bracket(1950))).toEqual({
            kind: "rated",
            tier: "Diamond",
        })
    })

    it("keeps the payload's null tier as Valhallan once placements are done", () => {
        expect(rankedBracketState({ ...bracket(1950), tier: null })).toEqual({
            kind: "rated",
            tier: "Valhallan",
        })
    })

    it("reports a missing bracket instead of inventing a tier", () => {
        expect(rankedBracketState(null)).toEqual({ kind: "missing" })
    })
})

describe("eloReset", () => {
    it("returns the payload reset with the tier the helper assigns mid-ladder", () => {
        expect(eloReset(bracket(1950))).toEqual({
            rating: 1950,
            tier: "Platinum 5",
        })
    })

    it("returns the payload reset with the tier the helper assigns at the top of the ladder", () => {
        expect(eloReset(bracket(2511))).toEqual({
            rating: 2511,
            tier: "Diamond",
        })
    })

    it("returns null for a missing bracket instead of crashing", () => {
        expect(eloReset(null)).toBeNull()
    })
})
