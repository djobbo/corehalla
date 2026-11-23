import { describe, expect, it } from "@effect/vitest"
import {
    attribution,
    communityLinks,
    disclaimer,
    trademark,
} from "./communityLinks"

const ABSOLUTE_HTTPS = /^https:\/\/[^/\s]+/

describe("communityLinks", () => {
    it("lists the four community destinations in display order", () => {
        expect(communityLinks.map((link) => link.label)).toEqual([
            "Discord",
            "X (Twitter)",
            "GitHub",
            "Ko-fi",
        ])
    })

    it("points every entry at an absolute https destination", () => {
        for (const link of communityLinks) {
            expect(link.href).toMatch(ABSOLUTE_HTTPS)
        }
    })

    it("never repeats a destination", () => {
        const hrefs = communityLinks.map((link) => link.href)

        expect(new Set(hrefs).size).toBe(hrefs.length)
    })

    it("gives every entry a visible label", () => {
        for (const link of communityLinks) {
            expect(link.label.trim()).not.toBe("")
        }
    })
})

describe("footer statements", () => {
    it("credits both asset sources", () => {
        expect(attribution).toContain("Blue Mammoth Games")
        expect(attribution).toContain("Freepik")
        expect(attribution).toContain("Flaticon")
    })

    it("disclaims affiliation with and endorsement by Blue Mammoth Games", () => {
        expect(disclaimer).toContain("Blue Mammoth Games")
        expect(disclaimer).toMatch(/neither associated nor endorsed/i)
    })

    it("names Brawlhalla and Blue Mammoth Games as trademarks", () => {
        expect(trademark).toContain("Brawlhalla")
        expect(trademark).toContain("Blue Mammoth Games")
        expect(trademark.toLowerCase()).toContain("trademarks")
    })

    it("leaves no placeholder in any statement", () => {
        for (const statement of [attribution, disclaimer, trademark]) {
            expect(statement.trim()).not.toBe("")
            expect(statement).not.toMatch(/\{\{|TODO|FIXME|TBD|lorem ipsum/i)
        }
    })
})
