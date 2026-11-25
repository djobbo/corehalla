import { describe, expect, it } from "@effect/vitest"
import { legendsMap } from "@crh/bhapi/legends"
import { compareLegends } from "./legendCompare"
import type { LegendCompareRow } from "./legendCompare"
import type { LegendMetaRow } from "@crh/api-contract/schemas"

const bodvar = legendsMap[3]
const cassidy = legendsMap[4]

const playStyle = (
    overrides: Partial<LegendMetaRow["playStyle"]> = {},
): LegendMetaRow["playStyle"] => ({
    accounts: 9_400,
    damageDealtPerGame: 410.25,
    damageTakenPerGame: 402.5,
    kosPerGame: 1.4,
    fallsPerGame: 1.18,
    suicidesPer100Games: 0.72,
    averageMatchSeconds: 208,
    weaponOneShare: 0.5833,
    weaponTwoShare: 0.4167,
    ...overrides,
})

const metaRow = (overrides: Partial<LegendMetaRow> = {}): LegendMetaRow => ({
    legendId: bodvar.legend_id,
    slug: "3-bdvar",
    games: 9_400,
    wins: 4_794,
    winRate: 0.51,
    playShare: 0.1234,
    accounts: 9_400,
    playStyle: playStyle(),
    ...overrides,
})

const rowFor = (
    rows: readonly LegendCompareRow[],
    label: string,
): LegendCompareRow => {
    const row = rows.find((entry) => entry.label === label)

    if (row === undefined) throw new Error(`missing row: ${label}`)

    return row
}

describe("compareLegends", () => {
    it("keeps the row order and labels stable", () => {
        expect(
            compareLegends(bodvar, cassidy, []).map((row) => row.label),
        ).toEqual([
            "Strength",
            "Dexterity",
            "Defense",
            "Speed",
            "Play share",
            "Win rate",
            "Games",
            "Accounts",
            "Damage dealt / game",
            "Damage taken / game",
            "KOs / game",
            "Falls / game",
            "Suicides / 100 games",
            "Average match",
            "Held weapon time",
        ])
    })

    it("never awards a winner to a raw attribute", () => {
        const rows = compareLegends(bodvar, cassidy, [
            metaRow({ legendId: bodvar.legend_id }),
            metaRow({ legendId: cassidy.legend_id }),
        ])

        expect(rowFor(rows, "Strength")).toMatchObject({
            a: "6 / 10",
            b: "6 / 10",
            winner: null,
        })
        expect(rowFor(rows, "Dexterity")).toMatchObject({
            a: "6 / 10",
            b: "8 / 10",
            winner: null,
        })
        expect(rowFor(rows, "Defense").winner).toBeNull()
        expect(rowFor(rows, "Speed").winner).toBeNull()
    })

    it("awards the higher win rate", () => {
        const aWins = compareLegends(bodvar, cassidy, [
            metaRow({ legendId: bodvar.legend_id, winRate: 0.53 }),
            metaRow({ legendId: cassidy.legend_id, winRate: 0.49 }),
        ])
        const bWins = compareLegends(bodvar, cassidy, [
            metaRow({ legendId: bodvar.legend_id, winRate: 0.49 }),
            metaRow({ legendId: cassidy.legend_id, winRate: 0.53 }),
        ])

        expect(rowFor(aWins, "Win rate").winner).toBe("a")
        expect(rowFor(bWins, "Win rate").winner).toBe("b")
    })

    it("awards higher damage dealt and KOs per game", () => {
        const rows = compareLegends(bodvar, cassidy, [
            metaRow({
                legendId: bodvar.legend_id,
                playStyle: playStyle({
                    damageDealtPerGame: 425.5,
                    kosPerGame: 1.55,
                }),
            }),
            metaRow({
                legendId: cassidy.legend_id,
                playStyle: playStyle({
                    damageDealtPerGame: 390.25,
                    kosPerGame: 1.22,
                }),
            }),
        ])

        expect(rowFor(rows, "Damage dealt / game")).toMatchObject({
            a: "425.5",
            b: "390.25",
            winner: "a",
        })
        expect(rowFor(rows, "KOs / game").winner).toBe("a")
    })

    it("awards the lower damage taken, falls and suicides", () => {
        const rows = compareLegends(bodvar, cassidy, [
            metaRow({
                legendId: bodvar.legend_id,
                playStyle: playStyle({
                    damageTakenPerGame: 380.5,
                    fallsPerGame: 0.98,
                    suicidesPer100Games: 0.4,
                }),
            }),
            metaRow({
                legendId: cassidy.legend_id,
                playStyle: playStyle({
                    damageTakenPerGame: 421.75,
                    fallsPerGame: 1.32,
                    suicidesPer100Games: 0.91,
                }),
            }),
        ])

        expect(rowFor(rows, "Damage taken / game").winner).toBe("a")
        expect(rowFor(rows, "Falls / game").winner).toBe("a")
        expect(rowFor(rows, "Suicides / 100 games").winner).toBe("a")
    })

    it("leaves equal values with no winner", () => {
        const rows = compareLegends(bodvar, cassidy, [
            metaRow({ legendId: bodvar.legend_id }),
            metaRow({ legendId: cassidy.legend_id }),
        ])

        expect(rowFor(rows, "Win rate").winner).toBeNull()
        expect(rowFor(rows, "Damage dealt / game").winner).toBeNull()
        expect(rowFor(rows, "Falls / game").winner).toBeNull()
    })

    it("dashes an unknown metric and never lets it win the row", () => {
        const rows = compareLegends(bodvar, cassidy, [
            metaRow({
                legendId: bodvar.legend_id,
                playStyle: playStyle({ damageDealtPerGame: 425.5 }),
            }),
            metaRow({
                legendId: cassidy.legend_id,
                playStyle: playStyle({ damageDealtPerGame: null }),
            }),
        ])

        expect(rowFor(rows, "Damage dealt / game")).toMatchObject({
            a: "425.5",
            b: "—",
            winner: null,
        })
        expect(rowFor(rows, "Damage taken / game").winner).toBeNull()
    })

    it("keeps a legend with no meta row on the page with dashed metrics", () => {
        const rows = compareLegends(bodvar, cassidy, [
            metaRow({ legendId: bodvar.legend_id }),
        ])

        expect(rowFor(rows, "Strength").a).toBe("6 / 10")
        expect(rowFor(rows, "Play share")).toMatchObject({
            a: "12.34%",
            b: "—",
            winner: null,
        })
        expect(rowFor(rows, "Games")).toMatchObject({ a: "9,400", b: "—" })
        expect(rowFor(rows, "Average match")).toMatchObject({
            a: "3m 28s",
            b: "—",
        })
        expect(rowFor(rows, "Held weapon time")).toMatchObject({
            a: "58.33% Grapple Hammer · 41.67% Sword",
            b: "—",
            winner: null,
        })
    })
})
