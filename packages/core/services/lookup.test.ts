import { describe, expect, it } from "@effect/vitest"
import { matchTier, mergeLookup } from "./lookup"
import type { AliasHit, ClanHit, PlayerHit } from "./lookup"

/**
 * The merge and ranking rules of the federated lookup.
 *
 * These are pure functions, so the questions that actually decide whether the
 * lookup feels right are testable without a network, a database or a Worker:
 * which of two matching rows comes first, what happens to a player found by two
 * sources, and whether a renamed player is reachable by the old name.
 */

const player = (over: Partial<PlayerHit> & { playerId: string; name: string }): PlayerHit => ({
    rating: 2000,
    tier: "Diamond",
    region: "eu",
    ...over,
})

const clan = (over: Partial<ClanHit> & { id: string; name: string }): ClanHit => ({
    xp: 1000,
    ...over,
})

const alias = (over: Partial<AliasHit> & { playerId: string; mainAlias: string }): AliasHit => ({
    otherAliases: [],
    ...over,
})

const merge = (
    over: Partial<Parameters<typeof mergeLookup>[0]> = {},
) =>
    mergeLookup({
        query: "boom",
        players: [],
        aliases: [],
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

        // A shorter name matching the same prefix is the closer answer, and
        // that outranks prominence: the highest-rated row here comes last.
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

        // The clan matches exactly and the player only by prefix, so the clan
        // leads regardless of type.
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
        // The caller passes 1v1 hits first; a team rating must not replace a
        // player's own rating.
        const rows = merge({
            players: [
                player({ playerId: "7", name: "boom", rating: 2100 }),
                player({ playerId: "7", name: "boom", rating: 1500, tier: null }),
            ],
        })

        expect(rows).toHaveLength(1)
        expect(rows[0]?.rating).toBe(2100)
        expect(rows[0]?.source).toBe("rankings")
    })

    it("emits an alias-only player with no rating, marked as archival", () => {
        const rows = merge({
            aliases: [
                alias({
                    playerId: "42",
                    mainAlias: "boomold",
                    otherAliases: ["boomolder"],
                }),
            ],
        })

        expect(rows[0]).toMatchObject({
            type: "player",
            id: "42",
            name: "boomold",
            rating: null,
            tier: null,
            source: "archive",
        })
        expect(rows[0]?.aliases).toEqual(["boomolder"])
    })

    it("ranks a renamed player by the old name that matched", () => {
        // The current name does not match the query at all; only the alias
        // does. Ranking on the display name alone would sink this row to the
        // bottom even though the alias is an exact hit.
        const rows = merge({
            query: "boom",
            players: [player({ playerId: "1", name: "zzz" })],
            aliases: [alias({ playerId: "2", mainAlias: "someone", otherAliases: ["boom"] })],
        })

        expect(rows[0]?.id).toBe("2")
    })

    it("attaches aliases to a player the rankings already found", () => {
        const rows = merge({
            players: [player({ playerId: "5", name: "boomnew" })],
            aliases: [
                alias({
                    playerId: "5",
                    mainAlias: "boomnew",
                    otherAliases: ["boomold"],
                }),
            ],
        })

        expect(rows).toHaveLength(1)
        // The current name is dropped from the alias list rather than repeated.
        expect(rows[0]?.aliases).toEqual(["boomold"])
        expect(rows[0]?.source).toBe("rankings")
    })

    it("does not duplicate a player who appears in both the ladder and the alias index", () => {
        const rows = merge({
            players: [player({ playerId: "5", name: "boomnew" })],
            aliases: [alias({ playerId: "5", mainAlias: "boomnew" })],
        })

        expect(rows).toHaveLength(1)
    })
})
