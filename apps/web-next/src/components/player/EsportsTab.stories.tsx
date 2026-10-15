import type { Meta, StoryObj } from "@storybook/react-vite"
import { EsportsTab } from "./EsportsTab"
import { registerMockRoute, withMockApi } from "@/storybook/decorators"

const updatedAt = Date.UTC(2026, 9, 15, 12, 0, 0)

const esportsEnvelope = {
    data: {
        identity: {
            esportsId: 501,
            fullName: "Marcus Lindqvist",
            pronoun: null,
            sggPlayerId: 123456,
            cmPlayerId: null,
            twitter: "mordex",
            twitch: "mordex",
            country: "SE",
        },
        pr: {
            "1v1": {
                top8: 4,
                top32: 9,
                gold: 3,
                silver: 2,
                bronze: 1,
                powerRanking: 6,
                region: "EU",
            },
            "2v2": {
                top8: 2,
                top32: 5,
                gold: 1,
                silver: 1,
                bronze: 0,
                powerRanking: 12,
                region: "EU",
            },
        },
        recentLegend: { name: "Mordex", count: 12 },
        teammates: [
            {
                brawlhallaId: 2,
                name: "Sandstorm",
                slug: "sandstorm",
                games: 48,
                lastTeamedDate: 1_750_000_000,
            },
            {
                brawlhallaId: null,
                name: "Unknown Duo",
                slug: null,
                games: 6,
                lastTeamedDate: 1_700_000_000,
            },
        ],
        placements: {
            "1v1": [
                {
                    placement: 1,
                    tournamentId: "t1",
                    tournamentName: "Autumn Championship",
                    eventName: "Main Event",
                    year: 2026,
                    isOfficial: true,
                    isTwos: false,
                    isOnline: false,
                    startTime: 1_750_000_000,
                    host: "Brawlhalla",
                },
                {
                    placement: 5,
                    tournamentId: "t2",
                    tournamentName: "Summer Cup",
                    eventName: null,
                    year: 2026,
                    isOfficial: true,
                    isTwos: false,
                    isOnline: true,
                    startTime: 1_740_000_000,
                    host: null,
                },
            ],
            "2v2": [
                {
                    placement: 3,
                    tournamentId: "t3",
                    tournamentName: "Winter Doubles",
                    eventName: "Finals",
                    year: 2025,
                    isOfficial: true,
                    isTwos: true,
                    isOnline: false,
                    startTime: 1_730_000_000,
                    host: "Brawlhalla",
                },
            ],
        },
    },
    meta: { updated_at: updatedAt },
}

const emptyEsportsEnvelope = {
    data: {
        identity: null,
        pr: { "1v1": null, "2v2": null },
        recentLegend: null,
        teammates: [],
        placements: { "1v1": [], "2v2": [] },
    },
    meta: { updated_at: updatedAt },
}

registerMockRoute("/api/v1/players/4242/esports", esportsEnvelope)
registerMockRoute("/api/v1/players/4243/esports", emptyEsportsEnvelope)

const meta = {
    title: "Features/Player/Esports tab",
    component: EsportsTab,
    decorators: [withMockApi],
    parameters: { layout: "padded" },
} satisfies Meta<typeof EsportsTab>

export default meta
type Story = StoryObj<typeof meta>

export const PowerRanked: Story = {
    args: { playerId: 4242 },
}

export const NoRecord: Story = {
    args: { playerId: 4243 },
}
