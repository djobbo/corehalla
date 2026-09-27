import { describe, expect, it } from "vitest"
import {
    isCompletePlayer3v3Ranked,
    toPlayer3v3Ranked,
} from "./v1"
import type { V1PlayerRankedStats } from "./v1"

/**
 * The 3v3 player read, against the payloads v1 actually returns.
 *
 * Every fixture below is a response captured live from
 * `GET /v1/player/stats?brawlhalla_id=…&mode=ranked_3v3`. That mode is the only
 * source for this record — the legacy API has no 3v3 mode — so unlike the other
 * mappings there is no second source whose behaviour could cover a mistake here.
 *
 * Two facts the fixtures encode, both of which changed the implementation:
 *
 * - A player with no 3v3 games gets **HTTP 404 "Player not found"**, not an
 *   empty record. `getOptionalJson` already collapses that to `null`, which is
 *   why "no record" and "no such player" are the same value downstream.
 * - `region_ranks` and `global_rank` appear only near the top of a region, so
 *   they are not fields the card can rely on. They are dropped rather than
 *   mapped onto a rank that would show up on some cards and not others.
 */

/** The ordinary case: a ranked record, no per-region rank. */
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

/** The same shape, but with the `region_ranks`/`global_rank` v1 adds near the top. */
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

    /*
     * v1 spells regions uppercase and calls Japan `JPS`; our stored vocabulary
     * is lowercase and calls it `jpn`. The card feeds this straight to
     * `regionFlagSrc`, which uppercases it again to find
     * `/images/icons/flags/JPN.png` — so an untranslated `jps` would render a
     * broken flag rather than an obviously wrong one.
     */
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
        // Both payloads map to the same keys: a top-2 player's card is the same
        // card as anyone else's, which is the point of dropping it.
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

    /*
     * The top tier is reported as `null`, so requiring a non-null `tier` would
     * silently delete every Valhallan player's card — the exact players the
     * 3v3 ladder is most likely to surface.
     */
    it("accepts a Valhallan record, whose tier v1 reports as null", () => {
        expect(isCompletePlayer3v3Ranked({ ...diamond, tier: null })).toBe(true)
    })

    /*
     * `rating` is documented as "may appear null … retry the call later". There
     * is no v0 fallback to hand the request to, so an incomplete payload has to
     * be reported as "no record" rather than rendered as a zero-rated card.
     */
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
