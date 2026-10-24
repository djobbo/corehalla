import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"
import { rankings1v1Mock } from "@crh/bhapi/mocks/rankings1v1"
import { rankings2v2Mock } from "@crh/bhapi/mocks/rankings2v2"
import { V1Unavailable } from "../upstream/v1"
import { directRankings1v1, directRankings2v2 } from "./rankings"
import type { V1UpstreamShape } from "../upstream/client"

const upstream = (
    getRankings: V1UpstreamShape["getRankings"],
): V1UpstreamShape => ({ getRankings }) as unknown as V1UpstreamShape

describe("direct rankings fallback", () => {
    it("builds the 1v1 board without archive best legends", async () => {
        const result = await Effect.runPromise(
            directRankings1v1(
                upstream(() => Effect.succeed(rankings1v1Mock)),
                "eu",
                1,
            ),
        )

        expect(result.data).toHaveLength(rankings1v1Mock.length)
        expect(result.data[0]?.best_legend?.id).toBe(50)
        expect(result.meta.updated_at).toBeGreaterThan(0)
    })

    it("builds a 2v2 board", async () => {
        const result = await Effect.runPromise(
            directRankings2v2(
                upstream(() => Effect.succeed(rankings2v2Mock)),
                "eu",
                1,
            ),
        )

        expect(result.data).toHaveLength(rankings2v2Mock.length)
        expect(result.data[0]?.team).toHaveLength(2)
    })

    it("maps an upstream failure to a section error", async () => {
        const result = await Effect.runPromise(
            directRankings1v1(
                upstream(() =>
                    Effect.fail(
                        new V1Unavailable({
                            operation: "getRankings",
                            reason: "status",
                            status: 500,
                        }),
                    ),
                ),
                "eu",
                1,
            ).pipe(Effect.result),
        )

        expect(result._tag).toBe("Failure")

        if (result._tag === "Failure") {
            expect(result.failure._tag).toBe("SectionFailed")
        }
    })
})
