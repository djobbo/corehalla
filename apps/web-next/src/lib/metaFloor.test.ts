import { describe, expect, it } from "@effect/vitest"
import {
    formatMetaCount,
    metaEmpty,
    metaFloorLabel,
    metaFloorSample,
    metaFloorSearch,
    resolveMetaFloor,
} from "./metaFloor"

describe("formatMetaCount", () => {
    it("groups thousands the same way on both sides of the render", () => {
        expect(formatMetaCount(18204)).toBe("18,204")
        expect(formatMetaCount(0)).toBe("0")
    })
})

describe("metaFloorLabel", () => {
    it("labels every floor in the filter", () => {
        expect(metaFloorLabel("all")).toBe("All")
        expect(metaFloorLabel("1500")).toBe("1500+")
    })
})

describe("metaFloorSample", () => {
    it("states the whole indexed population", () => {
        expect(metaFloorSample(18204, "all")).toBe(
            "Across 18,204 indexed accounts",
        )
    })

    it("names the rating floor", () => {
        expect(metaFloorSample(18204, "1800")).toBe(
            "Across 18,204 indexed accounts at 1800+ rating",
        )
    })
})

describe("metaEmpty", () => {
    it("names the subject and the filter that has no rows", () => {
        expect(metaEmpty("weapon", "2200")).toBe(
            "No weapon games are indexed at 2200+ rating yet.",
        )
        expect(metaEmpty("weapon", "all")).toBe(
            "No weapon games are indexed yet.",
        )
        expect(metaEmpty("legend", "all")).toBe(
            "No legend games are indexed yet.",
        )
    })
})

describe("resolveMetaFloor", () => {
    it("accepts every floor the API offers", () => {
        expect(resolveMetaFloor("1800")).toBe("1800")
        expect(resolveMetaFloor("all")).toBe("all")
    })

    it("falls back to the whole index for an unknown filter", () => {
        expect(resolveMetaFloor("9999")).toBe("all")
        expect(resolveMetaFloor(undefined)).toBe("all")
    })
})

describe("metaFloorSearch", () => {
    it("leaves the whole index out of the URL", () => {
        expect(metaFloorSearch("all")).toEqual({})
        expect(metaFloorSearch("2000")).toEqual({ floor: "2000" })
    })
})
