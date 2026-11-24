import { describe, expect, it } from "@effect/vitest"
import { standingLabel } from "./guildStanding"

describe("standingLabel", () => {
    it("states the place against the indexed guilds", () => {
        expect(standingLabel({ rank: 12, total: 4509 })).toBe(
            "#12 of 4,509 indexed guilds by XP",
        )
    })

    it("has nothing to say about a guild the archive has not indexed", () => {
        expect(standingLabel({ rank: null, total: 4509 })).toBeNull()
    })

    it("has nothing to say when no archive read backed the envelope", () => {
        expect(standingLabel({ rank: null, total: null })).toBeNull()
    })
})
