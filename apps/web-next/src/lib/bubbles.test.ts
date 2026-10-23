import { describe, expect, it } from "vite-plus/test"
import { bubbleWinrate, formatMetric } from "./bubbles"
import type { BubbleNode } from "./bubbles"

const bubble = (overrides: Partial<BubbleNode> = {}): BubbleNode => ({
    key: "Sword",
    name: "Sword",
    icon: "/images/icons/weapons/Sword.png",
    matchtime: 900,
    kos: 12,
    damage_dealt: 2700,
    games: 10,
    wins: 5,
    ...overrides,
})

describe("bubbleWinrate", () => {
    it("percentages wins over games", () => {
        expect(bubbleWinrate(bubble())).toBe(50)
    })

    it("is null without a record to winrate over", () => {
        expect(bubbleWinrate(bubble({ wins: undefined }))).toBeNull()
        expect(
            bubbleWinrate(bubble({ games: undefined, wins: undefined })),
        ).toBeNull()
    })
})

describe("formatMetric", () => {
    it("rounds the active metric", () => {
        expect(formatMetric(bubble({ matchtime: 12.6 }), "matchtime")).toBe(
            "13",
        )
        expect(formatMetric(bubble({ kos: 3.4 }), "kos")).toBe("3")
    })
})
