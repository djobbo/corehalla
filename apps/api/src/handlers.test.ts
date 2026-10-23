import { describe, expect, it } from "@effect/vitest"
import { aliasRows } from "./helpers/aliases"

// Upstream JSON can omit `name`; types say string only after the mapper normalises.
describe("aliasRows", () => {
    it("skips a player with no name instead of throwing", () => {
        expect(aliasRows({ id: 10154596, name: undefined })).toEqual([])
        expect(aliasRows({ id: 1166872, name: undefined })).toEqual([])
    })

    it("skips a player with a blank or whitespace name", () => {
        expect(aliasRows({ id: 1, name: "" })).toEqual([])
        expect(aliasRows({ id: 1, name: "   " })).toEqual([])
    })

    it("skips the zero id the payloads use as a 'no player' sentinel", () => {
        expect(aliasRows({ id: 0, name: "Boomie" })).toEqual([])
        expect(aliasRows({ id: "0", name: "Boomie" })).toEqual([])
    })

    it("stores a real player, folded the same way the search needle is", () => {
        const rows = aliasRows({ id: 5461700, name: "Lopes" })

        expect(rows).toHaveLength(1)
        expect(rows[0]).toMatchObject({
            playerId: "5461700",
            alias: "Lopes",
            aliasLower: "lopes",
            public: true,
        })
    })

    it("accepts a string id, which is how the archive spells them", () => {
        expect(aliasRows({ id: "5461700", name: "Lopes" })[0]?.playerId).toBe(
            "5461700",
        )
    })
})
