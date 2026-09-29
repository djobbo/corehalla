import { describe, expect, it } from "@effect/vitest"
import { aliasRows } from "./helpers/aliases"

/**
 * The alias guard, which is where `GET /api/v1/stats/clan/9` (since moved
 * under `/api/v1/upstream/brawlhalla`) died.
 *
 * v1 intermittently omits the `name` key on a guild member — the same request
 * returned all nineteen named and, on other calls, two of them with no `name`
 * at all. The members are real and their profiles resolve, so the field is
 * absent rather than empty, and `searchKey` calls `.trim()`: the missing name
 * threw a `TypeError` straight out of the clan handler and the endpoint answered
 * 500 with nothing logged.
 *
 * The absent case is the one worth pinning, because it is invisible in the
 * types — `Clan.clan[].name` is `string`, and it is `string` only because the
 * mapper normalises it. Upstream JSON is not validated, so anything reaching
 * this function from the wire can be missing.
 */

describe("aliasRows", () => {
    it("skips a player with no name instead of throwing", () => {
        // The regression. Before this guard the call threw
        // `TypeError: Cannot read properties of undefined (reading 'trim')`.
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
