import { describe, expect, it } from "@effect/vitest"
import { weapons } from "@crh/bhapi/constants"
import { compareBy } from "./useSortBy"
import type { LegendMetaRow } from "./legendMeta"
import type { LegendPlayStyle } from "@crh/api-contract/schemas"
import {
    filterLegendMetaByWeapon,
    formatLegendMetaRate,
    legendMetaDefaultDirection,
    legendMetaDefaultSort,
    legendMetaRank,
    legendMetaRankLabel,
    legendMetaSorts,
    legendMetaWeaponEmpty,
    legendMetaWeaponOptions,
    legendMetaWeaponSample,
    legendMetaWeaponSearch,
    resolveLegendMetaWeapon,
} from "./legendMeta"

const playStyle = (over: Partial<LegendPlayStyle> = {}): LegendPlayStyle => ({
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
    ...over,
})

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
    playStyle: playStyle(),
    ...over,
})

describe("formatLegendMetaRate", () => {
    it("renders a fraction as a percentage", () => {
        expect(formatLegendMetaRate(0.1234)).toBe("12.34%")
        expect(formatLegendMetaRate(0.5)).toBe("50%")
        expect(formatLegendMetaRate(1)).toBe("100%")
    })

    it("drops trailing zeros instead of padding them", () => {
        expect(formatLegendMetaRate(0.06)).toBe("6%")
        expect(formatLegendMetaRate(0.0667)).toBe("6.67%")
    })

    it("renders an empty sample as zero, not NaN", () => {
        expect(formatLegendMetaRate(0)).toBe("0%")
    })
})

describe("legendMetaSorts", () => {
    it("offers play share, win rate and the play-style metrics", () => {
        expect(Object.keys(legendMetaSorts)).toEqual([
            "playShare",
            "winRate",
            "damageDealtPerGame",
            "averageMatchSeconds",
            "suicidesPer100Games",
            "games",
        ])
    })

    it("opens on play share, highest first", () => {
        expect(legendMetaDefaultSort).toBe("playShare")
        expect(legendMetaDefaultDirection).toBe("desc")
    })

    it("compares play share and win rate numerically", () => {
        const rows = [row(3, { playShare: 0.5 }), row(4, { playShare: 0.2 })]

        expect(
            [...rows]
                .sort(legendMetaSorts.playShare.compare)
                .map((r) => r.legendId),
        ).toEqual([4, 3])
    })

    it("compares games numerically", () => {
        const rows = [row(3, { games: 10 }), row(4, { games: 400 })]

        expect(
            [...rows]
                .sort(legendMetaSorts.games.compare)
                .map((r) => r.legendId),
        ).toEqual([3, 4])
    })

    it("compares damage, match length and suicides numerically", () => {
        const rows = [
            row(3, {
                playStyle: playStyle({
                    damageDealtPerGame: 412.75,
                    averageMatchSeconds: 200,
                    suicidesPer100Games: 0.82,
                }),
            }),
            row(4, {
                playStyle: playStyle({
                    damageDealtPerGame: 380.2,
                    averageMatchSeconds: 240,
                    suicidesPer100Games: 0.4,
                }),
            }),
        ]

        expect(
            [...rows]
                .sort(legendMetaSorts.damageDealtPerGame.compare)
                .map((r) => r.legendId),
        ).toEqual([4, 3])
        expect(
            [...rows]
                .sort(legendMetaSorts.averageMatchSeconds.compare)
                .map((r) => r.legendId),
        ).toEqual([3, 4])
        expect(
            [...rows]
                .sort(legendMetaSorts.suicidesPer100Games.compare)
                .map((r) => r.legendId),
        ).toEqual([4, 3])
    })

    it("sorts a legend without the metric behind every legend that has one", () => {
        const rows = [
            row(3, { playStyle: playStyle({ damageDealtPerGame: null }) }),
            row(4, { playStyle: playStyle({ damageDealtPerGame: 300 }) }),
            row(5, { playStyle: playStyle({ damageDealtPerGame: 500 }) }),
        ]

        expect(
            [...rows]
                .sort(compareBy(legendMetaSorts.damageDealtPerGame, "asc"))
                .map((r) => r.legendId),
        ).toEqual([4, 5, 3])
        expect(
            [...rows]
                .sort(compareBy(legendMetaSorts.damageDealtPerGame, "desc"))
                .map((r) => r.legendId),
        ).toEqual([5, 4, 3])
    })

    it("keeps the incoming order on a tie", () => {
        const rows = [row(3, { playShare: 0.4 }), row(5, { playShare: 0.4 })]

        expect(
            [...rows]
                .sort(legendMetaSorts.playShare.compare)
                .map((r) => r.legendId),
        ).toEqual([3, 5])
    })
})

describe("legendMetaRank", () => {
    it("counts the legends ahead on the metric", () => {
        const rows = [
            row(3, { playShare: 0.4 }),
            row(4, { playShare: 0.25 }),
            row(5, { playShare: 0.1 }),
        ]

        expect(legendMetaRank(rows, 4, "playShare")).toEqual({
            position: 2,
            total: 3,
        })
    })

    it("gives tied legends the same position", () => {
        const rows = [
            row(3, { winRate: 0.53 }),
            row(4, { winRate: 0.5 }),
            row(5, { winRate: 0.5 }),
        ]

        expect(legendMetaRank(rows, 4, "winRate")).toEqual({
            position: 2,
            total: 3,
        })
        expect(legendMetaRank(rows, 5, "winRate")).toEqual({
            position: 2,
            total: 3,
        })
    })

    it("gives a one-row board the first position", () => {
        expect(legendMetaRank([row(3, { games: 10 })], 3, "games")).toEqual({
            position: 1,
            total: 1,
        })
    })

    it("returns nothing for a legend the board does not list", () => {
        expect(legendMetaRank([row(3)], 4, "playShare")).toBeNull()
        expect(legendMetaRank([], 3, "playShare")).toBeNull()
    })

    it("returns nothing for a metric the legend does not report", () => {
        const rows = [
            row(3, { playStyle: playStyle({ damageDealtPerGame: null }) }),
            row(4, { playStyle: playStyle({ damageDealtPerGame: 300 }) }),
        ]

        expect(legendMetaRank(rows, 3, "damageDealtPerGame")).toBeNull()
    })

    it("measures a play-style metric against the reporting legends", () => {
        const rows = [
            row(3, { playStyle: playStyle({ averageMatchSeconds: 240 }) }),
            row(4, { playStyle: playStyle({ averageMatchSeconds: 180 }) }),
            row(5, { playStyle: playStyle({ averageMatchSeconds: null }) }),
        ]

        expect(legendMetaRank(rows, 3, "averageMatchSeconds")).toEqual({
            position: 1,
            total: 2,
        })
        expect(legendMetaRank(rows, 4, "averageMatchSeconds")).toEqual({
            position: 2,
            total: 2,
        })
    })
})

describe("legendMetaRankLabel", () => {
    it("names the position and the legends that report the metric", () => {
        expect(legendMetaRankLabel({ position: 4, total: 15 })).toBe("#4 of 15")
    })
})

describe("legendMetaWeaponOptions", () => {
    it("opens with All and then every weapon in roster order", () => {
        expect(legendMetaWeaponOptions.map((option) => option.value)).toEqual([
            "all",
            ...weapons,
        ])
    })

    it("labels each option with the weapon's name", () => {
        expect(legendMetaWeaponOptions[0]?.label).toBe("All weapons")

        for (const weapon of weapons) {
            expect(
                legendMetaWeaponOptions.find(
                    (option) => option.value === weapon,
                )?.label,
            ).toBe(weapon)
        }
    })
})

describe("resolveLegendMetaWeapon", () => {
    it("round-trips every weapon through its URL value", () => {
        for (const weapon of weapons) {
            expect(
                resolveLegendMetaWeapon(legendMetaWeaponSearch(weapon).weapon),
            ).toBe(weapon)
        }
    })

    it("accepts the display name as well as the slug", () => {
        expect(resolveLegendMetaWeapon("grapple-hammer")).toBe("Grapple Hammer")
        expect(resolveLegendMetaWeapon("Grapple%20Hammer")).toBe(
            "Grapple Hammer",
        )
    })

    it("resolves an invalid, absent or non-string value to All", () => {
        expect(resolveLegendMetaWeapon("laser-sword")).toBe("all")
        expect(resolveLegendMetaWeapon("")).toBe("all")
        expect(resolveLegendMetaWeapon(undefined)).toBe("all")
        expect(resolveLegendMetaWeapon(null)).toBe("all")
        expect(resolveLegendMetaWeapon(42)).toBe("all")
    })
})

describe("legendMetaWeaponSearch", () => {
    it("leaves All out of the URL", () => {
        expect(legendMetaWeaponSearch("all")).toEqual({})
    })

    it("writes the weapon's kebab-case slug", () => {
        expect(legendMetaWeaponSearch("Grapple Hammer")).toEqual({
            weapon: "grapple-hammer",
        })
    })
})

describe("filterLegendMetaByWeapon", () => {
    // Bödvar wields a Grapple Hammer and a Sword, Cassidy Blasters and a
    // Grapple Hammer, Orion a Rocket Lance and a Spear.
    const board = [row(3), row(4), row(5)]

    it("matches the first weapon slot", () => {
        expect(
            filterLegendMetaByWeapon(board, "Blasters").map(
                (entry) => entry.legendId,
            ),
        ).toEqual([4])
    })

    it("matches the second weapon slot", () => {
        expect(
            filterLegendMetaByWeapon(board, "Sword").map(
                (entry) => entry.legendId,
            ),
        ).toEqual([3])
    })

    it("passes every row for All", () => {
        expect(filterLegendMetaByWeapon(board, "all")).toBe(board)
    })

    it("preserves the incoming order", () => {
        expect(
            filterLegendMetaByWeapon(
                [row(4), row(3), row(7)],
                "Grapple Hammer",
            ).map((entry) => entry.legendId),
        ).toEqual([4, 3, 7])
    })

    it("returns an empty board when no legend wields the weapon", () => {
        expect(filterLegendMetaByWeapon(board, "Katars")).toEqual([])
    })

    it("drops a row whose legend the roster does not list", () => {
        expect(
            filterLegendMetaByWeapon([row(3), row(9999)], "Sword").map(
                (entry) => entry.legendId,
            ),
        ).toEqual([3])
    })
})

describe("legendMetaWeaponSample", () => {
    it("states how many legends the weapon keeps out of the board", () => {
        expect(legendMetaWeaponSample(3, 58, "Grapple Hammer")).toBe(
            "3 of 58 legends wield Grapple Hammer",
        )
    })

    it("groups large counts like the rest of the board", () => {
        expect(legendMetaWeaponSample(1_204, 12_000, "Sword")).toBe(
            "1,204 of 12,000 legends wield Sword",
        )
    })

    it("says nothing when the whole board is shown", () => {
        expect(legendMetaWeaponSample(58, 58, "all")).toBeNull()
    })
})

describe("legendMetaWeaponEmpty", () => {
    it("names the weapon and the rating floor with no rows", () => {
        expect(legendMetaWeaponEmpty("Katars", "2200")).toBe(
            "No legend wielding Katars has indexed games at 2200+ rating yet.",
        )
        expect(legendMetaWeaponEmpty("Katars", "all")).toBe(
            "No legend wielding Katars has indexed games yet.",
        )
    })
})
