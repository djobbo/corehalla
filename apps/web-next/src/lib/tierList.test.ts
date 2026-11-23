import { describe, expect, it } from "@effect/vitest"
import { legends, legendsMap } from "@crh/bhapi/legends"
import {
    canonicalTierSearch,
    decodeTierBoard,
    emptyTierBoard,
    encodeTierBoard,
    placeLegend,
    poolLegends,
    tierLegends,
    tierListHref,
    tierNames,
    type TierBoard,
} from "./tierList"

const board = (overrides: Partial<Record<string, number[]>>): TierBoard => ({
    ...emptyTierBoard,
    ...overrides,
})

describe("encodeTierBoard", () => {
    it("writes a section per non-empty tier, in tier order", () => {
        expect(
            encodeTierBoard(board({ S: [3, 4], C: [5], F: [6, 7, 8] })),
        ).toBe("S:3,4;C:5;F:6,7,8")
    })

    it("omits empty tiers", () => {
        expect(encodeTierBoard(board({ A: [4] }))).toBe("A:4")
    })

    it("encodes an empty board to an empty value", () => {
        expect(encodeTierBoard(emptyTierBoard)).toBe("")
    })
})

describe("decodeTierBoard", () => {
    it("round-trips a fixed arrangement", () => {
        const source = board({ S: [3, 4], C: [5], F: [6, 7, 8] })

        expect(decodeTierBoard(encodeTierBoard(source))).toEqual(source)
    })

    it("preserves the order inside a tier", () => {
        expect(decodeTierBoard("S:8,3,5").S).toEqual([8, 3, 5])
        expect(decodeTierBoard("S:5,3,8").S).toEqual([5, 3, 8])
    })

    it("starts every tier empty for an empty value", () => {
        expect(decodeTierBoard("")).toEqual(emptyTierBoard)
        expect(decodeTierBoard(undefined)).toEqual(emptyTierBoard)
    })

    it("drops a repeated id, keeping its first placement", () => {
        expect(decodeTierBoard("S:3,4,3;A:4,5")).toEqual(
            board({ S: [3, 4], A: [5] }),
        )
    })

    it("drops an id the roster does not have", () => {
        expect(decodeTierBoard("S:999999,3")).toEqual(board({ S: [3] }))
        expect(decodeTierBoard("S:999999")).toEqual(emptyTierBoard)
    })

    it.each([
        "nope",
        "S",
        "S:",
        "S:3;;A:4",
        "S:3,a",
        "S:-3",
        "S:3.5",
        "X:3",
        "S:3;S:4",
    ])("falls back to the empty board for malformed input %p", (value) => {
        expect(decodeTierBoard(value)).toEqual(emptyTierBoard)
    })

    it.each([null, 42, { t: "S:3" }, ["S:3"]])(
        "falls back to the empty board for non-string input %p",
        (value) => {
            expect(decodeTierBoard(value)).toEqual(emptyTierBoard)
        },
    )

    it("keeps a full roster arrangement in one query value", () => {
        const ids = legends.map((legend) => legend.legend_id)
        const source = board({
            S: ids.slice(0, 10),
            A: ids.slice(10, 20),
            B: ids.slice(20, 30),
            C: ids.slice(30, 40),
            D: ids.slice(40, 50),
            F: ids.slice(50),
        })
        const encoded = encodeTierBoard(source)

        expect(encoded).not.toMatch(/[?&#]/)
        expect(decodeTierBoard(encoded)).toEqual(source)
        expect(Object.values(decodeTierBoard(encoded)).flat()).toHaveLength(
            legends.length,
        )
    })
})

describe("placeLegend", () => {
    it("appends a legend to the chosen tier", () => {
        expect(placeLegend(emptyTierBoard, 3, "S").S).toEqual([3])
    })

    it("moves a legend out of its old tier", () => {
        const placed = placeLegend(board({ S: [3, 4] }), 3, "B")

        expect(placed.S).toEqual([4])
        expect(placed.B).toEqual([3])
    })

    it("moves a legend back to the pool", () => {
        const placed = placeLegend(board({ S: [3, 4] }), 3, null)

        expect(placed).toEqual(board({ S: [4] }))
        expect(placed.S).toEqual([4])
    })

    it("keeps the tier order when re-placing inside the same tier", () => {
        expect(placeLegend(board({ S: [3, 4] }), 4, "S").S).toEqual([3, 4])
    })
})

describe("tierLegends", () => {
    it("resolves ids to legends in board order", () => {
        expect(
            tierLegends(board({ S: [5, 3] }), "S").map(
                (legend) => legend.legend_id,
            ),
        ).toEqual([5, 3])
    })

    it("skips an id the roster dropped", () => {
        expect(tierLegends(board({ S: [999999] }), "S")).toEqual([])
    })
})

describe("poolLegends", () => {
    it("lists every legend nobody placed, in roster order", () => {
        const placed = new Set([3, 5])
        const pool = poolLegends(board({ S: [3], A: [5] }))

        expect(pool.map((legend) => legend.legend_id)).toEqual(
            legends
                .filter((legend) => !placed.has(legend.legend_id))
                .map((legend) => legend.legend_id),
        )
    })

    it("holds the whole roster for an empty board", () => {
        expect(poolLegends(emptyTierBoard)).toHaveLength(legends.length)
    })

    it("keeps a pool of one legend's worth of ids", () => {
        const all = legends.map((legend) => legend.legend_id)
        const only = legendsMap[all[0]].legend_id
        const pool = poolLegends(board({ S: all.filter((id) => id !== only) }))

        expect(pool.map((legend) => legend.legend_id)).toEqual([only])
    })
})

describe("tierListHref", () => {
    it("points at the bare route for an empty board", () => {
        expect(tierListHref(emptyTierBoard)).toBe("/tiers")
    })

    it("carries the arrangement in one encoded query value", () => {
        const href = tierListHref(board({ S: [3, 4] }))

        expect(href.startsWith("/tiers?t=")).toBe(true)
        expect(href.match(/=/g)).toHaveLength(1)
        expect(
            decodeTierBoard(decodeURIComponent(href.split("?t=")[1])),
        ).toEqual(board({ S: [3, 4] }))
    })
})

describe("canonicalTierSearch", () => {
    it("keeps a canonical value as it is", () => {
        expect(canonicalTierSearch("S:3,4;A:5")).toBe("S:3,4;A:5")
    })

    it("rewrites a valid value into tier order", () => {
        expect(canonicalTierSearch("A:5;S:3,4")).toBe("S:3,4;A:5")
    })

    it("returns undefined for an empty board", () => {
        expect(canonicalTierSearch("")).toBeUndefined()
        expect(canonicalTierSearch(undefined)).toBeUndefined()
    })

    it("returns undefined for malformed input, not a throw", () => {
        expect(canonicalTierSearch("S:3;a:b")).toBeUndefined()
        expect(canonicalTierSearch(42)).toBeUndefined()
    })
})

describe("tierNames", () => {
    it("runs S, A, B, C, D, F", () => {
        expect(tierNames).toEqual(["S", "A", "B", "C", "D", "F"])
    })
})
