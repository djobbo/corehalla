import { describe, expect, it } from "@effect/vitest"
import {
    crawlTargetId,
    crawlTargets,
    playerIdsForRow,
} from "@crh/bhapi/crawlTargets"
import type { Ranking1v1, Ranking2v2, Ranking3v3 } from "@crh/bhapi/types"

/**
 * The crawl matrix and how a row is unpacked.
 *
 * The matrix exists because the crawler used to hard-code one call — a single
 * bracket and a single region value — so most of the product's ladders were
 * never walked. These assertions are what keep a ladder from quietly dropping
 * out of it again.
 */

const soloRow = (id: number): Ranking1v1 =>
    ({ brawlhalla_id: id }) as Ranking1v1

const trioRow = (id: number): Ranking3v3 =>
    ({ brawlhalla_id: id }) as Ranking3v3

const teamRow = (one: number, two: number): Ranking2v2 =>
    ({ brawlhalla_id_one: one, brawlhalla_id_two: two }) as Ranking2v2

describe("crawl targets", () => {
    it("covers every ladder across every region", () => {
        // 3 ladders × 10 regions. 3v3 was added after the fact, which is
        // exactly the kind of omission this asserts against.
        expect(crawlTargets).toHaveLength(30)
        expect(new Set(crawlTargets.map((t) => t.bracket))).toEqual(
            new Set(["1v1", "2v2", "3v3"]),
        )
        expect(new Set(crawlTargets.map((t) => t.region)).size).toBe(10)
    })

    it("gives every target a unique id", () => {
        const ids = crawlTargets.map((target) => target.id)

        expect(new Set(ids).size).toBe(ids.length)
        expect(ids).toContain(crawlTargetId("3v3", "eu"))
    })
})

describe("playerIdsForRow", () => {
    it("treats 1v1 and 3v3 as one player per row", () => {
        // 3v3 is a solo queue whose teams are assembled per match. Reading it as
        // a trio is what made the 3v3 ladder come back empty.
        expect(playerIdsForRow("1v1", soloRow(7))).toEqual([7])
        expect(playerIdsForRow("3v3", trioRow(7))).toEqual([7])
    })

    it("reads both members of a 2v2 team", () => {
        expect(playerIdsForRow("2v2", teamRow(1, 2))).toEqual([1, 2])
    })

    it("drops the zero sentinel", () => {
        // Brawlhalla uses 0 for "no player"; fetching it would upsert a
        // nonexistent id.
        expect(playerIdsForRow("2v2", teamRow(1, 0))).toEqual([1])
        expect(playerIdsForRow("1v1", soloRow(0))).toEqual([])
    })

    it("does not return the same player twice", () => {
        // A malformed row with one player in both slots would otherwise fetch
        // and upsert them twice in a single pass.
        expect(playerIdsForRow("2v2", teamRow(5, 5))).toEqual([5])
    })
})
