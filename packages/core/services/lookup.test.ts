import { describe, expect, it } from "@effect/vitest"
import { matchTier, mergeLookup } from "./lookup"
import type { ClanHit, PlayerHit } from "./lookup"

const player = (
    over: Partial<PlayerHit> & { playerId: string; name: string },
): PlayerHit => ({
    rating: 2000,
    tier: "Diamond",
    region: "eu",
    ...over,
})

const clan = (
    over: Partial<ClanHit> & { id: string; name: string },
): ClanHit => ({
    xp: 1000,
    ...over,
})

const merge = (over: Partial<Parameters<typeof mergeLookup>[0]> = {}) =>
    mergeLookup({
        query: "boom",
        players: [],
        clans: [],
        limit: 20,
        ...over,
    })

describe("matchTier", () => {
    it("ranks exact above prefix above anything else", () => {
        expect(matchTier("boom", "boom")).toBe(0)
        expect(matchTier("boom", "boomie")).toBe(1)
        expect(matchTier("boom", "theboomie")).toBe(2)
    })

    it("folds case and surrounding whitespace", () => {
        expect(matchTier("  BOOM ", "boom")).toBe(0)
        expect(matchTier("Boom", "BOOMIE")).toBe(1)
    })

    it("treats an empty query as no match rather than a match-all", () => {
        expect(matchTier("", "boom")).toBe(2)
    })
})

describe("mergeLookup ranking", () => {
    it("puts an exact match above a prefix match", () => {
        const rows = merge({
            players: [
                player({ playerId: "1", name: "boomie" }),
                player({ playerId: "2", name: "boom" }),
            ],
        })

        expect(rows.map((row) => row.name)).toEqual(["boom", "boomie"])
    })

    it("orders equal-quality matches by name length, shortest first", () => {
        const rows = merge({
            players: [
                player({ playerId: "1", name: "boomxyz", rating: 2500 }),
                player({ playerId: "2", name: "boomab", rating: 1800 }),
                player({ playerId: "3", name: "boom", rating: 1200 }),
            ],
        })

        expect(rows.map((row) => row.name)).toEqual([
            "boom",
            "boomab",
            "boomxyz",
        ])
    })

    it("breaks a length tie by prominence, within a type", () => {
        const rows = merge({
            players: [
                player({ playerId: "1", name: "boomaa", rating: 1200 }),
                player({ playerId: "2", name: "boombb", rating: 2500 }),
            ],
        })

        expect(rows.map((row) => row.name)).toEqual(["boombb", "boomaa"])
    })

    it("interleaves clans with players instead of grouping them", () => {
        const rows = merge({
            players: [player({ playerId: "1", name: "boomiez" })],
            clans: [clan({ id: "9", name: "boom" })],
        })

        expect(rows.map((row) => row.type)).toEqual(["clan", "player"])
    })

    it("truncates to the limit", () => {
        const rows = merge({
            players: [
                player({ playerId: "1", name: "booma" }),
                player({ playerId: "2", name: "boomb" }),
                player({ playerId: "3", name: "boomc" }),
            ],
            limit: 2,
        })

        expect(rows).toHaveLength(2)
    })
})

describe("mergeLookup sources", () => {
    it("keeps the 1v1 row when a player is found on both ladders", () => {
        const rows = merge({
            players: [
                player({ playerId: "7", name: "boom", rating: 2100 }),
                player({
                    playerId: "7",
                    name: "boom",
                    rating: 1500,
                    tier: null,
                }),
            ],
        })

        expect(rows).toHaveLength(1)
        expect(rows[0]?.rating).toBe(2100)
        expect(rows[0]?.source).toBe("rankings")
    })

    it("marks every ladder player a rankings hit with no aliases", () => {
        const rows = merge({
            players: [player({ playerId: "5", name: "boom" })],
        })

        expect(rows[0]).toMatchObject({
            type: "player",
            id: "5",
            rating: 2000,
            tier: "Diamond",
            source: "rankings",
            aliases: [],
        })
    })
})
