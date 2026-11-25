import { describe, expect, it } from "@effect/vitest"
import {
    allRosterFilters,
    isRosterFiltered,
    rosterEmptyMessage,
    rosterMatchSummary,
    rosterMatches,
    rosterRoleCounts,
} from "./guildRoster"
import type { GuildMember } from "@crh/api-contract/schemas"
import type { ClanRank } from "@crh/bhapi/constants"

const member = (
    id: number,
    name: string,
    rank: ClanRank = "Member",
): GuildMember => ({
    id,
    name,
    slug: `${id}-${name}`,
    rank,
    joined_at: 1_700_000_000,
    xp: 1_000,
    ranked: null,
})

const roster = [
    member(1, "Mordex", "Leader"),
    member(2, "Sandstorm", "Officer"),
    member(3, "Boomie", "Member"),
    member(4, "FreshlyPlaced", "Recruit"),
    member(5, "Mordekaiser", "Officer"),
]

const ids = (members: readonly GuildMember[]): readonly number[] =>
    members.map((entry) => entry.id)

describe("rosterMatches", () => {
    it("matches a case-insensitive substring of the in-game name", () => {
        expect(
            ids(rosterMatches(roster, { query: "DEX", role: "all" })),
        ).toEqual([1])
        expect(
            ids(rosterMatches(roster, { query: "  morde  ", role: "all" })),
        ).toEqual([1, 5])
    })

    it("returns the whole roster when nothing filters it", () => {
        expect(rosterMatches(roster, allRosterFilters)).toEqual(roster)
    })

    it("ignores zero-width padding and control characters in the name", () => {
        const padded = [
            member(1, "\u200bGhost\u200b", "Member"),
            member(2, "\u0001Wraith", "Member"),
            member(3, "B\u200danshee", "Member"),
        ]

        expect(
            ids(rosterMatches(padded, { query: "ghost", role: "all" })),
        ).toEqual([1])
        expect(
            ids(rosterMatches(padded, { query: "wraith", role: "all" })),
        ).toEqual([2])
        expect(
            ids(rosterMatches(padded, { query: "banshee", role: "all" })),
        ).toEqual([3])
    })

    it("strips the same padding from the typed query", () => {
        expect(
            ids(
                rosterMatches(roster, {
                    query: "\u200bmor\u200b",
                    role: "all",
                }),
            ),
        ).toEqual([1, 5])
    })

    it("matches the cleaned name the card renders, not the raw payload", () => {
        const mangled = [member(1, "BÃ¶dvar", "Member")]

        expect(
            ids(rosterMatches(mangled, { query: "bödvar", role: "all" })),
        ).toEqual([1])
    })

    it("filters by role alone", () => {
        expect(
            ids(rosterMatches(roster, { query: "", role: "Officer" })),
        ).toEqual([2, 5])
        expect(
            ids(rosterMatches(roster, { query: "", role: "Recruit" })),
        ).toEqual([4])
    })

    it("combines the name and role filters with AND", () => {
        expect(
            ids(rosterMatches(roster, { query: "mor", role: "Officer" })),
        ).toEqual([5])
        expect(
            ids(rosterMatches(roster, { query: "mor", role: "Leader" })),
        ).toEqual([1])
    })

    it("returns nothing when no member satisfies both filters", () => {
        expect(
            rosterMatches(roster, { query: "sandstorm", role: "Leader" }),
        ).toEqual([])
        expect(rosterMatches(roster, { query: "zzzz", role: "all" })).toEqual(
            [],
        )
    })

    it("returns nothing for a role the roster does not contain", () => {
        expect(
            rosterMatches([member(1, "Boomie", "Member")], {
                query: "",
                role: "Leader",
            }),
        ).toEqual([])
    })
})

describe("rosterRoleCounts", () => {
    it("counts every role the roster contains, in rank order", () => {
        expect(rosterRoleCounts(roster)).toEqual([
            { role: "Leader", count: 1 },
            { role: "Officer", count: 2 },
            { role: "Member", count: 1 },
            { role: "Recruit", count: 1 },
        ])
    })

    it("leaves out roles the roster does not contain", () => {
        expect(
            rosterRoleCounts([
                member(1, "Boomie", "Member"),
                member(2, "Sandstorm", "Member"),
            ]),
        ).toEqual([{ role: "Member", count: 2 }])
    })

    it("is empty for an empty roster", () => {
        expect(rosterRoleCounts([])).toEqual([])
    })
})

describe("rosterMatchSummary", () => {
    it("states matches against the whole roster", () => {
        expect(rosterMatchSummary(12, 197)).toBe("12 of 197 members")
        expect(rosterMatchSummary(197, 197)).toBe("197 of 197 members")
    })

    it("groups thousands", () => {
        expect(rosterMatchSummary(1_200, 12_400)).toBe(
            "1,200 of 12,400 members",
        )
    })

    it("reads naturally for a one-member roster", () => {
        expect(rosterMatchSummary(1, 1)).toBe("1 of 1 member")
    })
})

describe("isRosterFiltered", () => {
    it("is false for the default filters", () => {
        expect(allRosterFilters).toEqual({ query: "", role: "all" })
        expect(isRosterFiltered(allRosterFilters)).toBe(false)
        expect(isRosterFiltered({ query: "   ", role: "all" })).toBe(false)
    })

    it("is true when a name or a role is active", () => {
        expect(isRosterFiltered({ query: "mor", role: "all" })).toBe(true)
        expect(isRosterFiltered({ query: "", role: "Officer" })).toBe(true)
    })
})

describe("rosterEmptyMessage", () => {
    it("names both active filters", () => {
        expect(rosterEmptyMessage({ query: "mor", role: "Officer" })).toBe(
            "No members match “mor” with the Officer role.",
        )
    })

    it("names the name filter on its own", () => {
        expect(rosterEmptyMessage({ query: "zzzz", role: "all" })).toBe(
            "No members match “zzzz”.",
        )
    })

    it("names the role filter on its own", () => {
        expect(rosterEmptyMessage({ query: "", role: "Recruit" })).toBe(
            "No members have the Recruit role.",
        )
    })

    it("falls back to the empty roster", () => {
        expect(rosterEmptyMessage(allRosterFilters)).toBe(
            "This roster has no members.",
        )
    })
})
