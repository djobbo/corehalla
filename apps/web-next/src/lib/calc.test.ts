import { describe, expect, it } from "@effect/vitest"
import { getTierFromRating } from "@crh/bhapi/helpers/getTierFromRating"
import {
    eloSquash,
    gloryBreakdown,
    parseNumericInput,
    type GloryBreakdown,
} from "./calc"

const forGames = (games: number): GloryBreakdown =>
    gloryBreakdown({
        hasTenGames: games >= 10,
        wins: 150,
        bestRating: 2000,
    })

const squash = (personalRating: number, legendRating: number) =>
    eloSquash({ personalRating, legendRating })

describe("gloryBreakdown", () => {
    it("splits 150 wins and a 2000 best rating into 3000, 4370 and 7370", () => {
        expect(
            gloryBreakdown({
                hasTenGames: true,
                wins: 150,
                bestRating: 2000,
            }),
        ).toEqual({
            enough: true,
            fromWins: 3000,
            fromBestRating: 4370,
            total: 7370,
        })
    })

    it("reports not enough games at nine games", () => {
        expect(forGames(9)).toEqual({ enough: false })
    })

    it("reports not enough games at zero games, whatever the rating", () => {
        expect(forGames(0)).toEqual({ enough: false })
    })

    it("never returns a total the two parts do not add up to", () => {
        const breakdown = gloryBreakdown({
            hasTenGames: true,
            wins: 1234,
            bestRating: 1875,
        })

        expect(breakdown.enough).toBe(true)
        if (breakdown.enough) {
            expect(breakdown.total).toBe(
                breakdown.fromWins + breakdown.fromBestRating,
            )
        }
    })
})

describe("eloSquash", () => {
    it("leaves a personal rating at or above the floor alone", () => {
        expect(squash(1400, 0).personal.rating).toBe(1400)
        expect(squash(1399, 0).personal.rating).toBe(1399)
    })

    it("compresses a legend rating below 2000 by two thirds", () => {
        expect(squash(0, 1500).legend.rating).toBe(1250)
        expect(squash(0, 2000).legend.rating).toBe(1583)
    })

    it("passes a legend rating above 2000 through with a 1583 floor", () => {
        expect(squash(0, 2100).legend.rating).toBe(1593)
    })

    it("labels each squash with the tier of the squashed rating", () => {
        expect(squash(500, 0).personal.tier).toBe(getTierFromRating(500))
        expect(squash(1400, 0).personal.tier).toBe(getTierFromRating(1400))
        expect(squash(4000, 0).personal.tier).toBe(getTierFromRating(4000))
    })
})

describe("parseNumericInput", () => {
    it("reads blank and non-numeric input as zero", () => {
        expect(parseNumericInput("")).toBe(0)
        expect(parseNumericInput("abc")).toBe(0)
        expect(parseNumericInput("  ")).toBe(0)
    })

    it("clamps negatives to zero", () => {
        expect(parseNumericInput("-5")).toBe(0)
    })

    it("floors decimals", () => {
        expect(parseNumericInput("12.9")).toBe(12)
    })

    it("keeps whole numbers", () => {
        expect(parseNumericInput(" 2000 ")).toBe(2000)
    })
})
