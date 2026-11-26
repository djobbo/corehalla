import { describe, expect, it } from "@effect/vitest"
import { to1v1Rows, to2v2Rows, to3v3Rows } from "./ladderRows"
import { winRate } from "./stats"
import type {
    Rankings1v1Envelope,
    Rankings2v2Envelope,
    Rankings3v3Envelope,
} from "@crh/api-contract/schemas"

const meta = { updated_at: 1_700_000_000_000 }

const ref = (id: number, name: string) => ({
    id,
    name,
    slug: `${id}-${name.toLowerCase().replace(/ /g, "-")}`,
})

const oneVsOne: Rankings1v1Envelope = {
    data: [
        {
            rank: 1,
            rating: 2511,
            peak_rating: 2600,
            tier: "Valhallan",
            games: 76,
            wins: 71,
            region: "eu",
            id: 42,
            name: "Boomie",
            slug: "42-boomie",
            best_legend: null,
        },
        {
            rank: 2,
            rating: 2400,
            peak_rating: 2400,
            tier: null,
            games: 10,
            wins: 5,
            region: "us-e",
            id: 43,
            name: "Two",
            slug: "43-two",
            best_legend: {
                id: 3,
                name: "Bödvar",
                slug: "3-bodvar",
                games: 9,
                wins: 5,
            },
        },
        {
            rank: 3,
            rating: 2300,
            peak_rating: 2350,
            tier: "Diamond",
            games: 50,
            wins: 30,
            region: "eu",
            id: 44,
            name: "Three",
            slug: "44-three",
            best_legend: null,
        },
    ],
    meta,
}

const twoVsTwo: Rankings2v2Envelope = {
    data: [
        {
            rank: 1,
            rating: 2512,
            peak_rating: 2512,
            tier: null,
            games: 143,
            wins: 123,
            region: "us-e",
            team: [ref(1, "Pier"), ref(2, "Teke")],
        },
        {
            rank: 2,
            rating: 2000,
            peak_rating: 2000,
            tier: "Diamond",
            games: 5,
            wins: 2,
            region: "eu",
            team: [ref(3, "Solo"), { id: 0, name: "", slug: "0-" }],
        },
    ],
    meta,
}

const threeVsThree: Rankings3v3Envelope = {
    data: [
        {
            rank: 1,
            rating: 2400,
            peak_rating: 2400,
            tier: null,
            games: 30,
            wins: 20,
            region: "brz",
            id: 7,
            name: "Three",
            slug: "7-three",
        },
        {
            rank: 2,
            rating: 2100,
            peak_rating: 2200,
            tier: "Diamond",
            games: 40,
            wins: 22,
            region: "eu",
            id: 8,
            name: "Four",
            slug: "8-four",
        },
    ],
    meta,
}

describe("to1v1Rows", () => {
    it("keys a row by its slug and names the one member", () => {
        const [first] = to1v1Rows(oneVsOne)

        expect(first.key).toBe("42-boomie")
        expect(first.members).toEqual([
            { id: 42, name: "Boomie", slug: "42-boomie" },
        ])
    })

    it("labels a null tier as the top tier", () => {
        expect(to1v1Rows(oneVsOne)[1].tier).toBe("Valhallan")
    })

    it("passes an explicit tier through unchanged", () => {
        expect(to1v1Rows(oneVsOne)[2].tier).toBe("Diamond")
    })

    it("carries the record, peak and region of the row", () => {
        const [first] = to1v1Rows(oneVsOne)

        expect(first).toMatchObject({
            peakRating: 2600,
            games: 76,
            wins: 71,
            region: "eu",
        })
    })

    it("resolves the best legend to its name, icon key and page", () => {
        expect(to1v1Rows(oneVsOne)[1].legend).toEqual({
            name: "Bödvar",
            nameKey: "bodvar",
            href: "/legends/3-bdvar",
        })
    })

    it("leaves the legend off a row whose best legend is unknown", () => {
        expect(to1v1Rows(oneVsOne)[0].legend).toBeUndefined()
    })
})

describe("to2v2Rows", () => {
    it("keeps both members of a team", () => {
        const [team] = to2v2Rows(twoVsTwo)

        expect(team.key).toBe("1-2")
        expect(team.members.map((member) => member.slug)).toEqual([
            "1-pier",
            "2-teke",
        ])
    })

    it("drops the phantom partner of a solo-queue row", () => {
        expect(to2v2Rows(twoVsTwo)[1].members).toHaveLength(1)
    })

    it("labels a null tier as the top tier", () => {
        expect(to2v2Rows(twoVsTwo)[0].tier).toBe("Valhallan")
    })

    it("passes an explicit tier through unchanged", () => {
        expect(to2v2Rows(twoVsTwo)[1].tier).toBe("Diamond")
    })

    it("carries the team record but no per-team legend", () => {
        const [team] = to2v2Rows(twoVsTwo)

        expect(team).toMatchObject({
            peakRating: 2512,
            games: 143,
            wins: 123,
            region: "us-e",
        })
        expect(team.legend).toBeUndefined()
    })
})

describe("to3v3Rows", () => {
    it("treats the row as a single player", () => {
        const [row] = to3v3Rows(threeVsThree)

        expect(row.key).toBe("7-three")
        expect(row.members).toHaveLength(1)
    })

    it("carries the record but no legend", () => {
        const [row] = to3v3Rows(threeVsThree)

        expect(row).toMatchObject({
            peakRating: 2400,
            games: 30,
            wins: 20,
            region: "brz",
        })
        expect(row.legend).toBeUndefined()
    })

    it("labels a null tier as the top tier", () => {
        expect(to3v3Rows(threeVsThree)[0].tier).toBe("Valhallan")
    })

    it("passes an explicit tier through unchanged", () => {
        expect(to3v3Rows(threeVsThree)[1].tier).toBe("Diamond")
    })
})

describe("winRate", () => {
    it("reports the share of games won as a percentage", () => {
        expect(winRate(3, 10)).toBe(30)
    })

    it("reports zero for a row with no games", () => {
        expect(winRate(0, 0)).toBe(0)
    })

    it("never reports NaN", () => {
        expect(Number.isNaN(winRate(5, 0))).toBe(false)
    })
})
