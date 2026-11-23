import { describe, expect, it } from "vite-plus/test"
import {
    canonicalPath,
    resolveEntityId,
    resolvePlayerFilter,
} from "./routeParams"

describe("resolveEntityId", () => {
    it("reads the id at the head of a slug", () => {
        expect(resolveEntityId("1234-boomie")).toBe(1234)
    })

    it("accepts a bare id, so a link minted before slugs still resolves", () => {
        expect(resolveEntityId("1234")).toBe(1234)
    })

    it("falls back to zero for a segment with no id", () => {
        expect(resolveEntityId("boom")).toBe(0)
    })
})

describe("canonicalPath", () => {
    it("rewrites only the entity segment", () => {
        expect(
            canonicalPath(
                "/stats/players/1234",
                "/stats/players",
                "1234",
                "1234-boomie",
            ),
        ).toBe("/stats/players/1234-boomie")
    })

    it("keeps the tab segment — the regression this exists for", () => {
        expect(
            canonicalPath(
                "/stats/players/1234/legends",
                "/stats/players",
                "1234",
                "1234-boomie",
            ),
        ).toBe("/stats/players/1234-boomie/legends")
    })

    it("keeps an arbitrary tail, including nested segments", () => {
        expect(
            canonicalPath(
                "/stats/guilds/9/something/deeper",
                "/stats/guilds",
                "9",
                "9-the-guild",
            ),
        ).toBe("/stats/guilds/9-the-guild/something/deeper")
    })

    it("falls back to the bare canonical path when the segment does not match", () => {
        expect(
            canonicalPath(
                "/somewhere/else",
                "/stats/players",
                "1234",
                "1234-boomie",
            ),
        ).toBe("/stats/players/1234-boomie")
    })
})

describe("resolvePlayerFilter", () => {
    it("keeps a player prefix", () => {
        expect(resolvePlayerFilter("mord")).toBe("mord")
    })

    it("trims padding around the prefix", () => {
        expect(resolvePlayerFilter("  mord ")).toBe("mord")
    })

    it("reads an empty input as no filter, so the parameter is dropped", () => {
        expect(resolvePlayerFilter("")).toBeUndefined()
        expect(resolvePlayerFilter("   ")).toBeUndefined()
    })

    it("ignores anything that is not a string", () => {
        expect(resolvePlayerFilter(undefined)).toBeUndefined()
        expect(resolvePlayerFilter(["mord"])).toBeUndefined()
    })
})
