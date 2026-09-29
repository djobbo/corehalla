import { describe, expect, it } from "vite-plus/test"
import { to1v1Rows, to2v2Rows, to3v3Rows } from "./ladderRows"
import type {
    Rankings1v1Envelope,
    Rankings2v2Envelope,
    Rankings3v3Envelope,
} from "@crh/api-contract/schemas"

/**
 * The ladder envelopes, flattened into table rows.
 *
 * The API sends product rows — a slug per player and, for 2v2, the pair as a
 * tuple — so this is a shape change and nothing else. Two properties are worth
 * pinning: the row links to the slug rather than the id, and a solo-queue 2v2
 * row (a zero-id phantom partner) renders as one member rather than as a
 * nameless second one.
 */

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
            // v1 reports the top tier as null; the table needs a label.
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
    ],
    meta,
}

const twoVsTwo: Rankings2v2Envelope = {
    data: [
        {
            rank: 1,
            rating: 2512,
            peak_rating: 2512,
            tier: "Valhallan",
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
            // A solo queue: the server marks the phantom partner with id 0.
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
            tier: "Diamond",
            games: 30,
            wins: 20,
            region: "brz",
            id: 7,
            name: "Three",
            slug: "7-three",
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

    it("labels a null tier rather than rendering nothing", () => {
        expect(to1v1Rows(oneVsOne)[1].tier).toBe("Unranked")
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
})

describe("to3v3Rows", () => {
    it("treats the row as a single player", () => {
        const [row] = to3v3Rows(threeVsThree)

        expect(row.key).toBe("7-three")
        expect(row.members).toHaveLength(1)
    })
})
