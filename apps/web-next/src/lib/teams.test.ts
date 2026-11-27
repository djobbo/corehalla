import { describe, expect, it } from "@effect/vitest"
import { bestTeam, bestTeamSummary, pairedTeams, teamPartner } from "./teams"
import type {
    PlayerRanked2v2,
    PlayerRankedTeam,
} from "@crh/api-contract/schemas"

const team = (
    partnerId: number,
    overrides: Partial<PlayerRankedTeam> = {},
): PlayerRankedTeam => ({
    team: [
        { id: 4242, name: "Mordex", slug: "4242-mordex" },
        { id: partnerId, name: `Partner ${partnerId}`, slug: `${partnerId}-p` },
    ],
    paired: true,
    rating: 2_000,
    peak_rating: 2_100,
    tier: "Diamond",
    wins: 120,
    games: 200,
    region: "eu",
    global_rank: null,
    rating_reset: 1_950,
    ...overrides,
})

const soloQueue = (
    overrides: Partial<PlayerRankedTeam> = {},
): PlayerRankedTeam => team(0, { paired: false, ...overrides })

const partnerOf = (entry: PlayerRankedTeam | null): number | null =>
    entry === null ? null : entry.team[1].id

describe("pairedTeams", () => {
    it("drops solo-queue phantom entries", () => {
        expect(pairedTeams([team(2), soloQueue(), team(3)])).toHaveLength(2)
    })
})

describe("bestTeam", () => {
    it("returns null for an empty list", () => {
        expect(bestTeam([])).toBeNull()
    })

    it("returns null when every entry is unpaired", () => {
        expect(bestTeam([soloQueue(), soloQueue()])).toBeNull()
    })

    it("picks the highest-rated paired team", () => {
        const best = bestTeam([
            team(2, { rating: 1_990 }),
            team(3, { rating: 2_040 }),
            team(4, { rating: 2_010 }),
        ])

        expect(partnerOf(best)).toBe(3)
    })

    it("never picks an unpaired entry, however high its rating", () => {
        const best = bestTeam([
            soloQueue({ rating: 2_400, peak_rating: 2_500 }),
            team(2, { rating: 1_900 }),
        ])

        expect(partnerOf(best)).toBe(2)
    })

    it("breaks a rating tie on peak rating", () => {
        const best = bestTeam([
            team(2, { rating: 2_000, peak_rating: 2_050 }),
            team(3, { rating: 2_000, peak_rating: 2_120 }),
            team(4, { rating: 2_000, peak_rating: 2_010 }),
        ])

        expect(partnerOf(best)).toBe(3)
    })

    it("breaks a rating and peak tie on games played", () => {
        const best = bestTeam([
            team(2, { rating: 2_000, peak_rating: 2_100, games: 180 }),
            team(3, { rating: 2_000, peak_rating: 2_100, games: 260 }),
        ])

        expect(partnerOf(best)).toBe(3)
    })

    it("keeps the first entry when rating, peak and games all tie", () => {
        const best = bestTeam([team(2), team(3)])

        expect(partnerOf(best)).toBe(2)
    })
})

const record = (teams: readonly PlayerRankedTeam[]): PlayerRanked2v2 => ({
    games: teams.reduce((sum, entry) => sum + entry.games, 0),
    wins: teams.reduce((sum, entry) => sum + entry.wins, 0),
    average_rating: 2_000,
    average_peak_rating: 2_100,
    teams,
})

describe("bestTeamSummary", () => {
    it("stays null without a record, so a pending or failed read hides the card", () => {
        expect(bestTeamSummary(null)).toBeNull()
    })

    it("carries the chosen pair and the paired-team count", () => {
        const summary = bestTeamSummary(
            record([
                team(2, { rating: 1_990 }),
                soloQueue({ rating: 2_400 }),
                team(3, { rating: 2_040 }),
            ]),
        )

        expect(partnerOf(summary?.team ?? null)).toBe(3)
        expect(summary?.pairedTeams).toBe(2)
    })
})

describe("teamPartner", () => {
    it("returns the second ref when the player sits first", () => {
        expect(teamPartner(4242, team(2)).id).toBe(2)
    })

    it("returns the first ref when upstream puts the player second", () => {
        const reversed: PlayerRankedTeam = {
            ...team(2),
            team: [
                { id: 2, name: "Partner 2", slug: "2-p" },
                { id: 4242, name: "Mordex", slug: "4242-mordex" },
            ],
        }

        expect(teamPartner(4242, reversed).id).toBe(2)
    })
})
