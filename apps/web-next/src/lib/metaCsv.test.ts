import { describe, expect, it } from "@effect/vitest"
import { legendMetaCsv, metaCsvFilename, weaponMetaCsv } from "./metaCsv"
import type { LegendMetaCsvRow } from "./metaCsv"
import type { LegendMetaRow } from "./legendMeta"
import type { LegendPlayStyle } from "@crh/api-contract/schemas"
import type { WeaponMetaTableRow } from "./weaponMeta"

const playStyle = (over: Partial<LegendPlayStyle> = {}): LegendPlayStyle => ({
    accounts: 3_942,
    damageDealtPerGame: 412.75,
    damageTakenPerGame: 401.32,
    kosPerGame: 1.42,
    fallsPerGame: 1.21,
    suicidesPer100Games: 0.82,
    averageMatchSeconds: 208,
    weaponOneShare: 0.5833,
    weaponTwoShare: 0.4167,
    damageSplit: {
        weaponOne: 0.62,
        weaponTwo: 0.21,
        unarmed: 0.1,
        gadgets: 0.04,
        thrownItem: 0.03,
    },
    ...over,
})

const legendRow = (over: Partial<LegendMetaRow> = {}): LegendMetaRow => ({
    legendId: 3,
    slug: "3-bodvar",
    games: 2_602_100,
    wins: 1_353_092,
    winRate: 0.52,
    playShare: 0.0828,
    accounts: 3_942,
    playStyle: playStyle(),
    ...over,
})

const legendCsvRow = (
    name: string,
    over: Partial<LegendMetaRow> = {},
): LegendMetaCsvRow => ({ name, row: legendRow(over) })

const weaponRow = (
    over: Partial<WeaponMetaTableRow> = {},
): WeaponMetaTableRow => ({
    weapon: "Sword",
    meta: {
        weapon: "Sword",
        games: 402_000,
        wins: 205_000,
        winRate: 0.5099,
        playShare: 0.1204,
        accounts: 2_140,
        damagePerGame: 318.4,
        timeHeldPerGame: 96.2,
        kosPerGame: 0.94,
    },
    ...over,
})

const lines = (csv: string): readonly string[] => csv.split("\r\n")

describe("metaCsvFilename", () => {
    it("names the board and the active floor", () => {
        expect(metaCsvFilename("legends", "2200")).toBe(
            "corehalla-legends-2200.csv",
        )
        expect(metaCsvFilename("weapons", "all")).toBe(
            "corehalla-weapons-all.csv",
        )
    })
})

describe("legendMetaCsv", () => {
    it("writes the legend columns in board order", () => {
        expect(lines(legendMetaCsv([]))[0]).toBe(
            "Legend,Games,Wins,Win rate,Play share,Accounts,Damage per game,Average match seconds,Suicides per 100 games",
        )
    })

    it("exports counts as plain integers and rates as four-decimal fractions", () => {
        expect(lines(legendMetaCsv([legendCsvRow("Bödvar")]))[1]).toBe(
            "Bödvar,2602100,1353092,0.5200,0.0828,3942,412.75,208,0.82",
        )
    })

    it("rounds durations to whole seconds", () => {
        const csv = legendMetaCsv([
            legendCsvRow("Bödvar", {
                playStyle: playStyle({ averageMatchSeconds: 207.6 }),
            }),
        ])

        expect(lines(csv)[1]?.split(",")[7]).toBe("208")
    })

    it("leaves a null metric empty instead of zero", () => {
        const csv = legendMetaCsv([
            legendCsvRow("Bödvar", {
                playStyle: playStyle({
                    damageDealtPerGame: null,
                    averageMatchSeconds: null,
                    suicidesPer100Games: null,
                }),
            }),
        ])

        expect(lines(csv)[1]).toBe(
            "Bödvar,2602100,1353092,0.5200,0.0828,3942,,,",
        )
    })

    it("quotes fields holding a comma, a quote or a line break", () => {
        const csv = legendMetaCsv([
            legendCsvRow('Cassidy, "the Marshal"'),
            legendCsvRow("Queen\nNai"),
        ])

        expect(lines(csv)[1]).toBe(
            '"Cassidy, ""the Marshal""",2602100,1353092,0.5200,0.0828,3942,412.75,208,0.82',
        )
        expect(csv).toContain('"Queen\nNai"')
    })

    it("strips zero-width characters from the legend name", () => {
        const csv = legendMetaCsv([legendCsvRow("Böd\u200Bvar")])

        expect(lines(csv)[1]?.split(",")[0]).toBe("Bödvar")
    })

    it("keeps every row in the order it was given", () => {
        const csv = legendMetaCsv([
            legendCsvRow("Cassidy"),
            legendCsvRow("Bödvar"),
            legendCsvRow("Orion"),
        ])

        expect(
            lines(csv)
                .slice(1, 4)
                .map((line) => line.split(",")[0]),
        ).toEqual(["Cassidy", "Bödvar", "Orion"])
    })
})

describe("weaponMetaCsv", () => {
    it("writes the weapon columns in board order", () => {
        expect(lines(weaponMetaCsv([]))[0]).toBe(
            "Weapon,Games,Wins,Win rate,Play share,Accounts,Damage per game,Time held per game,KOs per game",
        )
    })

    it("exports counts as plain integers and rates as four-decimal fractions", () => {
        expect(lines(weaponMetaCsv([weaponRow()]))[1]).toBe(
            "Sword,402000,205000,0.5099,0.1204,2140,318.4,96,0.94",
        )
    })

    it("leaves a weapon the sample skipped entirely empty", () => {
        expect(
            lines(
                weaponMetaCsv([weaponRow({ weapon: "Chakram", meta: null })]),
            )[1],
        ).toBe("Chakram,,,,,,,,")
    })

    it("leaves a null metric empty instead of zero", () => {
        const csv = weaponMetaCsv([
            weaponRow({
                meta: {
                    weapon: "Sword",
                    games: 402_000,
                    wins: 205_000,
                    winRate: 0.5099,
                    playShare: 0.1204,
                    accounts: 2_140,
                    damagePerGame: null,
                    timeHeldPerGame: null,
                    kosPerGame: null,
                },
            }),
        ])

        expect(lines(csv)[1]).toBe("Sword,402000,205000,0.5099,0.1204,2140,,,")
    })

    it("keeps every row in the order it was given", () => {
        const csv = weaponMetaCsv([
            weaponRow({ weapon: "Gauntlets" }),
            weaponRow({ weapon: "Sword" }),
        ])

        expect(
            lines(csv)
                .slice(1, 3)
                .map((line) => line.split(",")[0]),
        ).toEqual(["Gauntlets", "Sword"])
    })
})
