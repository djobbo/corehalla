import { describe, expect, it } from "@effect/vitest"
import { LANDING_LEGENDS_LIMIT, landingLegends } from "./landingLegends"
import type {
    LegendMeta,
    LegendMetaRow,
    LegendPlayStyle,
} from "@crh/api-contract/schemas"

const playStyle: LegendPlayStyle = {
    accounts: 10,
    damageDealtPerGame: 412.75,
    damageTakenPerGame: 380.2,
    kosPerGame: 1.4,
    fallsPerGame: 1.03,
    suicidesPer100Games: 0.82,
    averageMatchSeconds: 200,
    weaponOneShare: 0.6,
    weaponTwoShare: 0.4,
    damageSplit: {
        weaponOne: 0.62,
        weaponTwo: 0.21,
        unarmed: 0.1,
        gadgets: 0.04,
        thrownItem: 0.03,
    },
}

const row = (
    legendId: number,
    over: Partial<LegendMetaRow> = {},
): LegendMetaRow => ({
    legendId,
    slug: `${legendId}-legend`,
    games: 100,
    wins: 50,
    winRate: 0.5,
    playShare: 0.25,
    accounts: 10,
    playStyle,
    ...over,
})

const board = (data: readonly LegendMetaRow[]): LegendMeta => ({
    data: [...data],
    meta: { accounts: 18_204, ratingFloor: null },
})

const ids = (rows: ReturnType<typeof landingLegends>): readonly number[] =>
    rows.map(({ legend }) => legend.legend_id)

const tiedIds = (order: readonly number[]): readonly number[] =>
    ids(
        landingLegends(
            board(order.map((legendId) => row(legendId, { playShare: 0.2 }))),
        ),
    )

describe("landingLegends", () => {
    it("returns nothing when the aggregate is absent", () => {
        expect(landingLegends(null)).toEqual([])
    })

    it("returns nothing for an empty board", () => {
        expect(landingLegends(board([]))).toEqual([])
    })

    it("caps the strip at the eight strongest legends", () => {
        const data = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(
            (legendId, index) =>
                row(legendId, { playShare: 0.2 - index / 1000 }),
        )

        const legends = landingLegends(board(data))

        expect(legends).toHaveLength(LANDING_LEGENDS_LIMIT)
        expect(ids(legends)).toEqual([3, 4, 5, 6, 7, 8, 9, 10])
    })

    it("orders by play share descending", () => {
        const legends = landingLegends(
            board([
                row(3, { playShare: 0.05 }),
                row(5, { playShare: 0.3 }),
                row(4, { playShare: 0.1 }),
            ]),
        )

        expect(ids(legends)).toEqual([5, 4, 3])
    })

    it("breaks a play-share tie on legend id, whatever the input order", () => {
        expect(tiedIds([7, 4, 5])).toEqual([4, 5, 7])
        expect(tiedIds([5, 7, 4])).toEqual([4, 5, 7])
    })

    it("drops rows whose legend id is not in the bundled roster", () => {
        const legends = landingLegends(
            board([row(9_999, { playShare: 0.9 }), row(4, { playShare: 0.1 })]),
        )

        expect(ids(legends)).toEqual([4])
    })

    it("carries the aggregate row alongside the roster legend", () => {
        const [entry] = landingLegends(
            board([row(3, { playShare: 0.13, winRate: 0.52 })]),
        )

        expect(entry?.legend.bio_name).toBe("Bödvar")
        expect(entry?.row.playShare).toBe(0.13)
        expect(entry?.row.winRate).toBe(0.52)
    })
})
