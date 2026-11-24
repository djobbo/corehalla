import { describe, expect, it } from "@effect/vitest"
import { communityActions, communityAnswer, communityPrompt } from "./community"
import { communityLinks, discordUrl } from "./communityLinks"

const ABSOLUTE_HTTPS = /^https:\/\/[^/\s]+/
const PLACEHOLDER = /\{\{|TODO|FIXME|TBD|lorem ipsum/i

const action = (label: string) => {
    const match = communityActions.find(
        (candidate) => candidate.label === label,
    )

    if (match === undefined) throw new Error(`no ${label} action`)

    return match
}

describe("community card content", () => {
    it("asks a question a visitor can answer in one line", () => {
        expect(communityPrompt.trim()).not.toBe("")
        expect(communityPrompt.length).toBeLessThanOrEqual(140)
    })

    it("leaves no placeholder in the question or the labels", () => {
        for (const text of [
            communityPrompt,
            communityAnswer.label,
            ...communityActions.map((entry) => entry.label),
        ]) {
            expect(text).not.toMatch(PLACEHOLDER)
        }
    })
})

describe("community actions", () => {
    it("gives every action a visible label and an absolute https destination", () => {
        expect(communityActions.length).toBeGreaterThan(0)

        for (const entry of communityActions) {
            expect(entry.label.trim()).not.toBe("")
            expect(entry.href).toMatch(ABSOLUTE_HTTPS)
        }
    })

    it("sends Join to the Discord invite", () => {
        expect(action("Join").href).toBe(discordUrl)
    })

    it("sends Support to the Ko-fi entry the footer lists", () => {
        const kofi = communityLinks.find((link) => link.label === "Ko-fi")

        expect(kofi).toBeDefined()
        expect(action("Support").href).toBe(kofi?.href)
    })
})

describe("community answer link", () => {
    it("opens Discord with a name that says so", () => {
        expect(communityAnswer.href).toBe(discordUrl)
        expect(communityAnswer.href).toMatch(ABSOLUTE_HTTPS)
        expect(communityAnswer.label).toContain("Discord")
    })
})
