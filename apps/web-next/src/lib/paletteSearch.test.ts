import { describe, expect, it } from "@effect/vitest"
import {
    CATALOGUE_GROUP_LIMIT,
    MIN_CATALOGUE_QUERY_LENGTH,
    catalogueMatches,
    matchLegends,
    matchWeapons,
} from "./paletteSearch"

const legendNames = (query: string) =>
    matchLegends(query).map((legend) => legend.bio_name)

const weaponNames = (query: string) => matchWeapons(query)

describe("matchLegends", () => {
    it("finds a legend by its exact display name", () => {
        expect(legendNames("Hattori")).toEqual(["Hattori"])
    })

    it("ranks prefix matches above earlier roster entries", () => {
        expect(legendNames("ra")).toEqual([
            "Ragnir",
            "Rayman",
            "Ransom",
            "Orion",
        ])
    })

    it("finds a legend by a fragment in the middle of its name", () => {
        expect(legendNames("vraxx")).toEqual(["Lord Vraxx"])
    })

    it("folds case on both sides", () => {
        expect(legendNames("BODVAR")).toEqual(["Bödvar"])
        expect(legendNames("boDvAr")).toEqual(["Bödvar"])
    })

    it("folds accents, so the name is reachable without them", () => {
        expect(legendNames("bodvar")).toEqual(["Bödvar"])
        expect(legendNames("bodvär")).toEqual(["Bödvar"])
    })

    it("finds a legend by an alias line", () => {
        expect(legendNames("viking")).toEqual(["Bödvar"])
    })

    it("finds a legend by the second alias", () => {
        expect(legendNames("great bear")).toEqual(["Bödvar"])
    })

    it("returns nothing for a single character", () => {
        expect(matchLegends("b")).toEqual([])
    })

    it("returns matches from two characters", () => {
        expect(MIN_CATALOGUE_QUERY_LENGTH).toBe(2)
        expect(legendNames("bo")).toContain("Bödvar")
    })

    it("caps the group and keeps roster order for equal ranks", () => {
        expect(CATALOGUE_GROUP_LIMIT).toBe(4)

        const matches = matchLegends("the")

        expect(matches).toHaveLength(CATALOGUE_GROUP_LIMIT)
        expect(matches.map((legend) => legend.legend_id)).toEqual([3, 4, 5, 6])
    })

    it("is stable across calls", () => {
        expect(matchLegends("the")).toEqual(matchLegends("the"))
    })

    it("honours an explicit limit", () => {
        expect(matchLegends("the", 2).map((legend) => legend.bio_name)).toEqual(
            ["Bödvar", "Cassidy"],
        )
    })

    it("returns nothing when no legend matches", () => {
        expect(matchLegends("zzzz")).toEqual([])
    })

    it("ignores surrounding whitespace", () => {
        expect(legendNames("  hattori  ")).toEqual(["Hattori"])
    })
})

describe("matchWeapons", () => {
    it("ranks a prefix match above an earlier weapon that contains it", () => {
        expect(weaponNames("or")).toEqual(["Orb", "Sword", "Greatsword"])
    })

    it("lists the exact name first even though another name contains it", () => {
        expect(weaponNames("Sword")).toEqual(["Sword", "Greatsword"])
    })

    it("finds a weapon by a prefix", () => {
        expect(weaponNames("gre")).toEqual(["Greatsword"])
    })

    it("finds a weapon by a mid-name fragment", () => {
        expect(weaponNames("ord")).toEqual(["Sword", "Greatsword"])
    })

    it("folds case and accents", () => {
        expect(weaponNames("SWÖRD")).toEqual(["Sword", "Greatsword"])
    })

    it("does not match weapon names against a legend alias", () => {
        expect(weaponNames("viking")).toEqual([])
    })

    it("returns nothing for a single character", () => {
        expect(matchWeapons("s")).toEqual([])
    })

    it("returns matches from two characters", () => {
        expect(weaponNames("sw")).toEqual(["Sword", "Greatsword"])
    })

    it("returns nothing when no weapon matches", () => {
        expect(matchWeapons("zzzz")).toEqual([])
    })
})

describe("catalogueMatches", () => {
    it("returns both groups for one query", () => {
        const matches = catalogueMatches("ord")

        expect(matches.legends[0]?.bio_name).toBe("Lord Vraxx")
        expect(matches.weapons).toEqual(["Sword", "Greatsword"])
    })

    it("returns empty groups below the minimum query length", () => {
        expect(catalogueMatches("o")).toEqual({ legends: [], weapons: [] })
    })

    it("returns empty groups when nothing matches", () => {
        expect(catalogueMatches("zzzz")).toEqual({ legends: [], weapons: [] })
    })

    it("applies the same cap to both groups", () => {
        const matches = catalogueMatches("the")

        expect(matches.legends).toHaveLength(CATALOGUE_GROUP_LIMIT)
        expect(matches.weapons.length).toBeLessThanOrEqual(
            CATALOGUE_GROUP_LIMIT,
        )
    })
})
