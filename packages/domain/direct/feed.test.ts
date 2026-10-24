import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"
import { BrawltoolsError } from "../brawltools"
import { emptyPlayerEsports } from "../esports"
import { directPlayerEsports } from "./esports"
import { directPowerRankings } from "./power"
import type { BrawltoolsShape } from "../brawltools"

const brawltools = (overrides: Partial<BrawltoolsShape>): BrawltoolsShape =>
    overrides as unknown as BrawltoolsShape

const unavailable = () =>
    new BrawltoolsError({ operation: "listPr", cause: "boom" })

describe("direct brawltools fallbacks", () => {
    it("returns the empty esports shape for an unknown player", async () => {
        const result = await Effect.runPromise(
            directPlayerEsports(
                brawltools({
                    getPlayerByBrawlhallaId: () => Effect.succeed(null),
                }),
                1,
            ),
        )

        expect(result.data).toEqual(emptyPlayerEsports)
    })

    it("maps an esports failure to a section error", async () => {
        const result = await Effect.runPromise(
            directPlayerEsports(
                brawltools({
                    getPlayerByBrawlhallaId: () => Effect.fail(unavailable()),
                }),
                1,
            ).pipe(Effect.result),
        )

        expect(result._tag).toBe("Failure")

        if (result._tag === "Failure") {
            expect(result.failure._tag).toBe("SectionFailed")
        }
    })

    it("builds a power board and carries the page count", async () => {
        const result = await Effect.runPromise(
            directPowerRankings(
                brawltools({
                    listPr: () =>
                        Effect.succeed({ prPlayers: [], totalPages: 3 }),
                }),
                {
                    gameMode: "1v1",
                    region: "EU",
                    page: 2,
                    orderBy: "powerRanking",
                },
            ),
        )

        expect(result.data).toEqual([])
        expect(result.meta.total_pages).toBe(3)
    })

    it("maps a power failure to a section error", async () => {
        const result = await Effect.runPromise(
            directPowerRankings(
                brawltools({ listPr: () => Effect.fail(unavailable()) }),
                {
                    gameMode: "1v1",
                    region: "EU",
                    page: 1,
                    orderBy: "powerRanking",
                },
            ).pipe(Effect.result),
        )

        expect(result._tag).toBe("Failure")

        if (result._tag === "Failure") {
            expect(result.failure._tag).toBe("SectionFailed")
        }
    })
})
