import { describe, expect, it } from "@effect/vitest"
import { guildLevel } from "./guild-levels"

/**
 * Brawlhalla's guild curve.
 *
 * The thresholds are the game's own, so the properties worth pinning are the
 * edges: a new guild must not read as a maxed one, progress must be a
 * percentage rather than a fraction, and a guild past the last threshold must
 * report the cap rather than dividing by a next level that does not exist.
 */
describe("guildLevel", () => {
    it("starts a brand-new guild at level 1 with no progress", () => {
        expect(guildLevel(0)).toEqual({ level: 1, xpPercentage: 0 })
    })

    it("reports progress toward the next threshold as a percentage", () => {
        // Halfway between the 20k and 200k thresholds.
        const { level, xpPercentage } = guildLevel(110_000)

        expect(level).toBe(2)
        expect(xpPercentage).toBeCloseTo(50, 5)
    })

    it("caps at the last level rather than the level after it", () => {
        expect(guildLevel(5_000_000)).toEqual({
            level: 5,
            xpPercentage: 100,
        })
    })
})
