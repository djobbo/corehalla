import { describe, expect, it } from "@effect/vitest"
import { ladderRedirectTarget } from "./legacyLadder"
import { parseLadderSearch } from "./routeParams"

const ORIGIN = "https://corehalla.test"

/** What the board's `validateSearch` does with the query the redirect emits. */
const boardSearch = (target: string) => {
    const url = new URL(target, ORIGIN)

    return parseLadderSearch(Object.fromEntries(url.searchParams))
}

describe("ladderRedirectTarget", () => {
    it("keeps the legacy path segments and drops nothing else", () => {
        expect(ladderRedirectTarget({})).toBe("/rankings/live/1v1")
        expect(ladderRedirectTarget({ region: "us-e" })).toBe(
            "/rankings/live/1v1/us-e",
        )
        expect(ladderRedirectTarget({ page: "2" })).toBe("/rankings/live/1v1/2")
        expect(ladderRedirectTarget({ region: "us-e", page: "2" })).toBe(
            "/rankings/live/1v1/us-e/2",
        )
    })

    it("carries the name filter to the board as `player`", () => {
        expect(ladderRedirectTarget({ q: "mord" })).toBe(
            "/rankings/live/1v1?player=mord",
        )
        expect(
            ladderRedirectTarget({ region: "us-e", page: "2", q: "mord" }),
        ).toBe("/rankings/live/1v1/us-e/2?player=mord")
    })

    it("drops a blank or whitespace-only filter", () => {
        expect(ladderRedirectTarget({ q: "" })).toBe("/rankings/live/1v1")
        expect(ladderRedirectTarget({ q: "   " })).toBe("/rankings/live/1v1")
    })

    it("trims the filter before encoding it", () => {
        expect(ladderRedirectTarget({ q: "  mord  " })).toBe(
            "/rankings/live/1v1?player=mord",
        )
    })

    it.each(["Mord the Great", "a&b", "a+b", "é"])(
        "encodes %s once so the board decodes it back",
        (q) => {
            const target = ladderRedirectTarget({ q })

            expect(target).toBe(
                `/rankings/live/1v1?player=${encodeURIComponent(q)}`,
            )
            expect(boardSearch(target)).toEqual({ player: q })
        },
    )

    it("drops the filter on ladders that have no name filter", () => {
        expect(
            ladderRedirectTarget({
                bracket: "2v2",
                region: "us-e",
                page: "2",
                q: "mord",
            }),
        ).toBe("/rankings/live/2v2/us-e/2")
        expect(ladderRedirectTarget({ bracket: "3v3", q: "mord" })).toBe(
            "/rankings/live/3v3",
        )
    })
})
