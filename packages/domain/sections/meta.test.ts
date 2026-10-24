import { describe, expect, it } from "@effect/vitest"
import { PLAN, sectionMeta, statusFromError, toSectionError } from "./meta"
import { V1Incomplete, V1NotFound, V1Unavailable } from "../upstream/v1"

describe("section metadata", () => {
    it("is complete when every source is terminal", () => {
        const meta = sectionMeta(PLAN.playerProfile, {
            stats: { status: "ok", updated_at: 200 },
            teams2v2: { status: "not_found", updated_at: 100 },
        })

        expect(meta.complete).toBe(true)
        expect(meta.updated_at).toBe(100)
        expect(meta.parts).toEqual({
            stats: "ok",
            teams2v2: "not_found",
        })
    })

    it("is incomplete when a source errored, and ignores its timestamp", () => {
        const meta = sectionMeta(
            PLAN.playerProfile,
            {
                stats: { status: "ok", updated_at: 200 },
                ranked1v1: { status: "transport", updated_at: 999 },
            },
            500,
        )

        expect(meta.complete).toBe(false)
        expect(meta.updated_at).toBe(200)
    })

    it("falls back to now when nothing terminal is available", () => {
        expect(
            sectionMeta(
                PLAN.playerProfile,
                { stats: { status: "status", updated_at: 1 } },
                777,
            ).updated_at,
        ).toBe(777)
    })

    it("maps upstream failures onto the part vocabulary", () => {
        expect(statusFromError(new V1NotFound({ operation: "stats" }))).toBe(
            "not_found",
        )
        expect(
            statusFromError(
                new V1Unavailable({
                    operation: "stats",
                    reason: "rate_limited",
                }),
            ),
        ).toBe("rate_limited")
        expect(
            statusFromError(
                new V1Unavailable({ operation: "stats", reason: "transport" }),
            ),
        ).toBe("transport")
        expect(
            statusFromError(
                new V1Incomplete({ operation: "stats", cause: "empty" }),
            ),
        ).toBe("incomplete")
    })

    it("picks the HTTP status from the failed source", () => {
        const rateLimited = toSectionError(PLAN.playerProfile, {
            stats: { status: "rate_limited", updated_at: 1 },
        })
        const timeout = toSectionError(PLAN.playerProfile, {
            stats: { status: "timeout", updated_at: 1 },
        })
        const failed = toSectionError(PLAN.playerProfile, {
            stats: { status: "status", updated_at: 1 },
        })

        expect(rateLimited._tag).toBe("SectionRateLimited")
        expect(timeout._tag).toBe("SectionTimedOut")
        expect(failed._tag).toBe("SectionFailed")
    })
})
