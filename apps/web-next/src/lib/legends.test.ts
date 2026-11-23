import { describe, expect, it } from "vite-plus/test"
import { legends, legendsMap } from "@crh/bhapi/legends"
import {
    legendAttributes,
    legendBoardHref,
    legendHref,
    legendSlug,
    relatedLegends,
    resolveLegend,
} from "./legends"

const bodvar = legendsMap[3]
const cassidy = legendsMap[4]

describe("legendSlug", () => {
    it("leads with the roster id", () => {
        expect(legendSlug(bodvar)).toBe("3-bdvar")
        expect(legendSlug(cassidy)).toBe("4-cassidy")
    })
})

describe("resolveLegend", () => {
    it("round-trips a slug minted by legendSlug", () => {
        expect(resolveLegend(legendSlug(bodvar))?.legend_id).toBe(3)
    })

    it("accepts a bare id, so a link minted before slugs still resolves", () => {
        expect(resolveLegend("3")?.bio_name).toBe("Bödvar")
    })

    it("returns null for an unknown id", () => {
        expect(resolveLegend("999")).toBeNull()
    })

    it("returns null for a segment with no id", () => {
        expect(resolveLegend("nope")).toBeNull()
    })
})

describe("legendHref", () => {
    it("points at the legend page", () => {
        expect(legendHref(bodvar)).toBe("/legends/3-bdvar")
        expect(legendHref(cassidy)).toBe("/legends/4-cassidy")
    })
})

describe("legendBoardHref", () => {
    it("points at the legend's career board", () => {
        expect(legendBoardHref(bodvar)).toBe("/rankings/career/legends/3")
    })
})

describe("legendAttributes", () => {
    it("parses the roster's four attribute strings", () => {
        expect(legendAttributes(bodvar)).toEqual({
            strength: 6,
            dexterity: 6,
            defense: 5,
            speed: 5,
        })
    })

    it("returns numbers, not strings", () => {
        const attributes = legendAttributes(cassidy)

        expect(Object.values(attributes).every(Number.isInteger)).toBe(true)
    })
})

describe("relatedLegends", () => {
    it("includes a legend that shares one of the weapons", () => {
        const ids = relatedLegends(bodvar, 6).map((legend) => legend.legend_id)

        expect(ids).toContain(cassidy.legend_id)
    })

    it("never includes the legend itself", () => {
        expect(relatedLegends(bodvar, 6)).not.toContainEqual(
            expect.objectContaining({ legend_id: bodvar.legend_id }),
        )
    })

    it("lists each legend once even when both weapons match", () => {
        const ids = relatedLegends(bodvar, 6).map((legend) => legend.legend_id)

        expect(new Set(ids).size).toBe(ids.length)
    })

    it("honours the limit", () => {
        expect(relatedLegends(bodvar, 2)).toHaveLength(2)
    })

    it("is stable across calls", () => {
        expect(relatedLegends(bodvar, 4)).toEqual(relatedLegends(bodvar, 4))
    })

    it("returns nothing when the limit is zero", () => {
        expect(relatedLegends(bodvar, 0)).toEqual([])
    })
})

describe("roster", () => {
    it("parses every legend's attributes to numbers", () => {
        expect(
            legends.every((legend) =>
                Object.values(legendAttributes(legend)).every(Number.isInteger),
            ),
        ).toBe(true)
    })
})
