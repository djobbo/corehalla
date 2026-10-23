import { describe, expect, it } from "vite-plus/test"
import { VIEW, packBubbles } from "./packBubbles"
import type { BubbleNode } from "./bubbles"

const bubble = (
    id: number,
    matchtime: number,
    kos: number,
    damage_dealt: number,
): BubbleNode => ({
    key: String(id),
    name: `Legend ${id}`,
    icon: `/images/icons/legends/${id}.png`,
    level: 1,
    matchtime,
    kos,
    damage_dealt,
    games: 10,
    wins: 5,
})

const radiusOf = (
    packed: ReturnType<typeof packBubbles>,
    key: string,
): number => packed.find((entry) => entry.data.key === key)!.radius

/** The largest placed bubble, whichever order the pack emitted. */
const heaviest = (packed: ReturnType<typeof packBubbles>): string =>
    [...packed].sort((a, b) => b.radius - a.radius)[0].data.key

describe("packBubbles", () => {
    /**
     * The chart tunes the scale per metric on purpose, so these assert the *shape*
     * of the transform rather than a fixed proportion: ordering is preserved, a
     * bubble with none of the metric is still drawn, and the exponent bends the
     * radius spread around the area-true one.
     */
    it("orders every bubble by the active metric", () => {
        const packed = packBubbles(
            [bubble(1, 1600, 0, 0), bubble(2, 400, 0, 0), bubble(3, 100, 0, 0)],
            "matchtime",
            1.1,
        )

        expect(radiusOf(packed, "1")).toBeGreaterThan(radiusOf(packed, "2"))
        expect(radiusOf(packed, "2")).toBeGreaterThan(radiusOf(packed, "3"))
    })

    it("bends the radius spread around the area-true exponent", () => {
        const rows = [bubble(1, 1600, 0, 0), bubble(2, 100, 0, 0)]

        const ratio = (scaleExponent: number): number => {
            const packed = packBubbles(rows, "matchtime", scaleExponent)

            return radiusOf(packed, "1") / radiusOf(packed, "2")
        }

        // Radius goes as `value ** (exponent / 2)`, so an exponent of 1 on a 16x
        // value spread is the 4x ratio pure area packing gives.
        expect(ratio(1)).toBeCloseTo(4, 2)
        expect(ratio(1.1)).toBeGreaterThan(ratio(1))
        expect(ratio(0.9)).toBeLessThan(ratio(1))
    })

    it("keeps a tiny bubble visible instead of packing it to nothing", () => {
        const packed = packBubbles(
            [
                bubble(1, 1_000_000, 0, 0),
                bubble(2, 1, 0, 0),
                bubble(3, 1, 0, 0),
            ],
            "matchtime",
            1.1,
        )

        // A million-to-one spread packs the tail to radius 0 without the share
        // floor, which is what dropped the tail for 13.5% of real players.
        for (const entry of packed) {
            expect(entry.radius).toBeGreaterThan(0)
        }
    })

    it("still draws a bubble with no time on the active metric", () => {
        const packed = packBubbles(
            [bubble(1, 1000, 0, 0), bubble(2, 0, 900, 0)],
            "matchtime",
            1.1,
        )

        expect(packed).toHaveLength(2)
        expect(radiusOf(packed, "2")).toBeGreaterThan(0)
    })

    it("weighs bubbles by the active metric", () => {
        const rows = [bubble(1, 100, 900, 0), bubble(2, 400, 10, 0)]

        expect(heaviest(packBubbles(rows, "matchtime", 1.1))).toBe("2")
        expect(heaviest(packBubbles(rows, "kos", 1.1))).toBe("1")
        expect(heaviest(packBubbles(rows, "damage_dealt", 1.1))).toBe("1")
    })

    it("keeps every bubble inside the canvas and apart from its neighbours", () => {
        const packed = packBubbles(
            [
                bubble(1, 700, 0, 0),
                bubble(2, 500, 0, 0),
                bubble(3, 300, 0, 0),
                bubble(4, 100, 0, 0),
            ],
            "matchtime",
            1.1,
        )

        for (const entry of packed) {
            expect(entry.x - entry.radius).toBeGreaterThanOrEqual(0)
            expect(entry.x + entry.radius).toBeLessThanOrEqual(VIEW)
            expect(entry.y - entry.radius).toBeGreaterThanOrEqual(0)
            expect(entry.y + entry.radius).toBeLessThanOrEqual(VIEW)
            expect(entry.radius).toBeGreaterThan(0)
        }

        for (let a = 0; a < packed.length; a += 1) {
            for (let b = a + 1; b < packed.length; b += 1) {
                const distance = Math.hypot(
                    packed[a].x - packed[b].x,
                    packed[a].y - packed[b].y,
                )

                expect(distance).toBeGreaterThanOrEqual(
                    packed[a].radius + packed[b].radius - 1e-6,
                )
            }
        }
    })

    it("matches each placed bubble back to its source object", () => {
        const source = [bubble(1, 10, 0, 0), bubble(2, 900, 0, 0)]

        const packed = packBubbles(source, "matchtime", 1.1)

        expect(packed.find((entry) => entry.data.key === "2")?.data).toBe(
            source[1],
        )
    })

    it("returns one bubble per input and an empty pack for none", () => {
        expect(
            packBubbles([bubble(1, 5, 0, 0)], "matchtime", 1.1),
        ).toHaveLength(1)
        expect(packBubbles([], "matchtime", 1.1)).toEqual([])
    })
})
