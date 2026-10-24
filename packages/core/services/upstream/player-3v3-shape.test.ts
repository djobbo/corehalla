import { describe, expect, it } from "vitest"
import {
    isCompletePlayer3v3Ranked,
    toPlayer3v3Ranked,
} from "@crh/domain/upstream/v1"
import type { V1PlayerRankedStats } from "@crh/domain/upstream/v1"

const diamond: V1PlayerRankedStats = {
    brawlhalla_id: 78717735,
    name: "☩ Pinocchio ☩",
    games: 29,
    wins: 28,
    rating: 2083,
    peak_rating: 2083,
    tier: "Diamond",
    region: "EU",
    region_ranks: [],
    legends: [],
}

const rankedSecondInEu: V1PlayerRankedStats = {
    brawlhalla_id: 25475700,
    name: "yurikoღ",
    games: 29,
    wins: 28,
    rating: 2081,
    peak_rating: 2081,
    tier: "Diamond",
    region: "EU",
    region_ranks: [{ region: "EU", rank: 2 }],
    legends: [],
}

describe("toPlayer3v3Ranked", () => {
    it("carries a live record through", () => {
        expect(toPlayer3v3Ranked(diamond)).toEqual({
            brawlhalla_id: 78717735,
            name: "☩ Pinocchio ☩",
            rating: 2083,
            peak_rating: 2083,
            tier: "Diamond",
            wins: 28,
            games: 29,
            region: "eu",
        })
    })

    it("lowercases the region and translates JPS to jpn", () => {
        expect(toPlayer3v3Ranked(diamond).region).toBe("eu")
        expect(toPlayer3v3Ranked({ ...diamond, region: "JPS" }).region).toBe(
            "jpn",
        )
        expect(toPlayer3v3Ranked({ ...diamond, region: "US-E" }).region).toBe(
            "us-e",
        )
    })

    it("drops region_ranks rather than inventing a rank field", () => {
        expect(Object.keys(toPlayer3v3Ranked(rankedSecondInEu))).toEqual(
            Object.keys(toPlayer3v3Ranked(diamond)),
        )
    })

    it("keeps a null tier as null, which the card renders as Valhallan", () => {
        expect(toPlayer3v3Ranked({ ...diamond, tier: null }).tier).toBeNull()
    })
})

describe("isCompletePlayer3v3Ranked", () => {
    it("accepts a live record", () => {
        expect(isCompletePlayer3v3Ranked(diamond)).toBe(true)
    })

    it("accepts a Valhallan record, whose tier v1 reports as null", () => {
        expect(isCompletePlayer3v3Ranked({ ...diamond, tier: null })).toBe(true)
    })

    it("rejects a payload v1 asked us to retry", () => {
        expect(isCompletePlayer3v3Ranked({ ...diamond, rating: null })).toBe(
            false,
        )
    })

    it("rejects a nameless payload", () => {
        expect(isCompletePlayer3v3Ranked({ ...diamond, name: "" })).toBe(false)
        expect(isCompletePlayer3v3Ranked({ ...diamond, name: "   " })).toBe(
            false,
        )
    })

    it("rejects the 404 that a player with no 3v3 games produces", () => {
        expect(isCompletePlayer3v3Ranked(null)).toBe(false)
    })
})
