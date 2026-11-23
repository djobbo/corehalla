import { describe, expect, it } from "@effect/vitest"
import { LANDING_FAVORITES_CAP, landingFavorites } from "./landingFavorites"
import type { Favorite } from "@crh/api-contract/schemas"

const favorites = (count: number): readonly Favorite[] =>
    Array.from({ length: count }, (_, index) => ({
        id: String(index + 1),
        type: "player",
        name: `Player ${index + 1}`,
        meta: {},
    }))

describe("landingFavorites", () => {
    it("shows and hides nothing for an empty list", () => {
        expect(landingFavorites([])).toEqual({ shown: [], hidden: 0 })
    })

    it("shows a single favourite without counting an overflow", () => {
        const result = landingFavorites(favorites(1))

        expect(result.shown).toHaveLength(1)
        expect(result.hidden).toBe(0)
    })

    it("shows every favourite when the list is exactly the cap", () => {
        const result = landingFavorites(favorites(LANDING_FAVORITES_CAP))

        expect(result.shown).toHaveLength(LANDING_FAVORITES_CAP)
        expect(result.hidden).toBe(0)
    })

    it("caps the list and counts the ones it leaves to the manage page", () => {
        const result = landingFavorites(favorites(LANDING_FAVORITES_CAP + 1))

        expect(result.shown).toHaveLength(LANDING_FAVORITES_CAP)
        expect(result.hidden).toBe(1)
    })

    it("keeps the input order in the shown list", () => {
        const shown = landingFavorites(
            favorites(LANDING_FAVORITES_CAP + 2),
        ).shown

        expect(shown.map((favorite) => favorite.id)).toEqual([
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
        ])
    })
})
