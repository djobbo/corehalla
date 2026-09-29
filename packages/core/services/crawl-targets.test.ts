import { describe, expect, it } from "@effect/vitest"
import {
    crawlTargetId,
    crawlTargets,
    playerIdsForRow,
} from "@crh/bhapi/crawlTargets"
import type { Ranking1v1, Ranking2v2, Ranking3v3 } from "@crh/bhapi/types"

const soloRow = (id: number): Ranking1v1 =>
    ({ brawlhalla_id: id }) as Ranking1v1

const trioRow = (id: number): Ranking3v3 =>
    ({ brawlhalla_id: id }) as Ranking3v3

const teamRow = (one: number, two: number): Ranking2v2 =>
    ({ brawlhalla_id_one: one, brawlhalla_id_two: two }) as Ranking2v2

describe("crawl targets", () => {
    it("covers every ladder across every region", () => {
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
        expect(playerIdsForRow("1v1", soloRow(7))).toEqual([7])
        expect(playerIdsForRow("3v3", trioRow(7))).toEqual([7])
    })

    it("reads both members of a 2v2 team", () => {
        expect(playerIdsForRow("2v2", teamRow(1, 2))).toEqual([1, 2])
    })

    it("drops the zero sentinel", () => {
        expect(playerIdsForRow("2v2", teamRow(1, 0))).toEqual([1])
        expect(playerIdsForRow("1v1", soloRow(0))).toEqual([])
    })

    it("does not return the same player twice", () => {
        expect(playerIdsForRow("2v2", teamRow(5, 5))).toEqual([5])
    })
})
