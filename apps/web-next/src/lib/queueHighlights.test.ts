import { describe, expect, it } from "@effect/vitest"
import { queueHighlights } from "./queueHighlights"
import type { QueuedEntry } from "@crh/api-contract/schemas"

const entry = (
    overrides: Partial<Omit<QueuedEntry, "members">> &
        Pick<QueuedEntry, "id"> & {
            readonly members?: QueuedEntry["members"]
        },
): QueuedEntry => ({
    members: [
        {
            id: overrides.id,
            name: `Player ${overrides.id}`,
            slug: overrides.id,
        },
    ],
    rating: 2000,
    peakRating: 2000,
    tier: "Diamond",
    games: 100,
    wins: 50,
    queuedAt: 0,
    rank: 10,
    ratingDelta: 0,
    rankDelta: 0,
    ...overrides,
})

describe("queueHighlights", () => {
    it("splits gains and losses into climbers and drops", () => {
        const { climbers, drops } = queueHighlights([
            entry({ id: "up", ratingDelta: 8 }),
            entry({ id: "down", ratingDelta: -5 }),
        ])

        expect(climbers.map((row) => row.id)).toEqual(["up"])
        expect(drops.map((row) => row.id)).toEqual(["down"])
    })

    it("orders climbers by gain descending and drops by loss ascending", () => {
        const { climbers, drops } = queueHighlights([
            entry({ id: "small-gain", ratingDelta: 2 }),
            entry({ id: "big-gain", ratingDelta: 14 }),
            entry({ id: "small-loss", ratingDelta: -1 }),
            entry({ id: "big-loss", ratingDelta: -9 }),
        ])

        expect(climbers.map((row) => row.id)).toEqual([
            "big-gain",
            "small-gain",
        ])
        expect(drops.map((row) => row.id)).toEqual(["big-loss", "small-loss"])
    })

    it("breaks ties on the higher rating, then the entry id", () => {
        const { climbers } = queueHighlights([
            entry({ id: "b", rating: 2100, ratingDelta: 8 }),
            entry({ id: "a", rating: 2100, ratingDelta: 8 }),
            entry({ id: "c", rating: 2050, ratingDelta: 8 }),
            entry({ id: "d", rating: 1900, ratingDelta: 9 }),
        ])

        expect(climbers.map((row) => row.id)).toEqual(["d", "a", "b", "c"])
    })

    it("breaks drop ties the same way", () => {
        const { drops } = queueHighlights([
            entry({ id: "f", rating: 2050, ratingDelta: -3 }),
            entry({ id: "e", rating: 2050, ratingDelta: -3 }),
            entry({ id: "h", rating: 2100, ratingDelta: -3 }),
            entry({ id: "g", rating: 2200, ratingDelta: -8 }),
        ])

        expect(drops.map((row) => row.id)).toEqual(["g", "h", "e", "f"])
    })

    it("caps each list at five entries", () => {
        const gains = Array.from({ length: 7 }, (_, index) =>
            entry({ id: `gain-${index}`, ratingDelta: index + 1 }),
        )
        const losses = Array.from({ length: 7 }, (_, index) =>
            entry({ id: `loss-${index}`, ratingDelta: -(index + 1) }),
        )

        const { climbers, drops } = queueHighlights([...gains, ...losses])

        expect(climbers).toHaveLength(5)
        expect(climbers[0]?.id).toBe("gain-6")
        expect(drops).toHaveLength(5)
        expect(drops[0]?.id).toBe("loss-6")
    })

    it("leaves entries with no rating change out of both lists", () => {
        const { climbers, drops } = queueHighlights([
            entry({ id: "flat", ratingDelta: 0 }),
        ])

        expect(climbers).toEqual([])
        expect(drops).toEqual([])
    })

    it("returns two empty lists for an empty queue", () => {
        expect(queueHighlights([])).toEqual({ climbers: [], drops: [] })
    })

    it("keeps both members of a team entry", () => {
        const { climbers } = queueHighlights([
            entry({
                id: "duo",
                ratingDelta: 11,
                members: [
                    { id: "1456", name: "Mordex", slug: "mordex" },
                    { id: "2087", name: "Sandstorm", slug: "sandstorm" },
                ],
            }),
        ])

        expect(climbers[0]?.members.map((member) => member.id)).toEqual([
            "1456",
            "2087",
        ])
    })
})
