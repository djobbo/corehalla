import type { Meta, StoryObj } from "@storybook/react-vite"
import { RankedQueueView } from "./RankedQueueView"
import { withRouter } from "@/storybook/decorators"
import type { QueuedEntry } from "@crh/api-contract/schemas"

const NOW = Date.UTC(2026, 9, 15, 12, 0, 0)

const solo: readonly QueuedEntry[] = [
    {
        id: "1",
        members: [{ id: "1456", name: "Mordex", slug: "mordex" }],
        rating: 2104,
        peakRating: 2150,
        tier: "Valhallan",
        games: 412,
        wins: 291,
        queuedAt: NOW - 2 * 60_000,
        rank: 12,
        ratingDelta: 8,
        rankDelta: -1,
    },
    {
        id: "2",
        members: [{ id: "2087", name: "Sandstorm", slug: "sandstorm" }],
        rating: 2061,
        peakRating: 2099,
        tier: "Diamond",
        games: 388,
        wins: 250,
        queuedAt: NOW - 11 * 60_000,
        rank: 34,
        ratingDelta: -5,
        rankDelta: 3,
    },
    {
        id: "3",
        members: [{ id: "5312", name: "Boomie", slug: "boomie" }],
        rating: 1988,
        peakRating: 2020,
        tier: "Diamond",
        games: 401,
        wins: 240,
        queuedAt: NOW - 90_000,
        rank: 0,
        ratingDelta: 0,
        rankDelta: 0,
    },
]

const teams: readonly QueuedEntry[] = [
    {
        id: "mordex-sandstorm",
        members: [
            { id: "1456", name: "Mordex", slug: "mordex" },
            { id: "2087", name: "Sandstorm", slug: "sandstorm" },
        ],
        rating: 2180,
        peakRating: 2210,
        tier: "Valhallan",
        games: 96,
        wins: 61,
        queuedAt: NOW - 4 * 60_000,
        rank: 3,
        ratingDelta: 12,
        rankDelta: -2,
    },
    {
        id: "boomie-lucians",
        members: [
            { id: "5312", name: "Boomie", slug: "boomie" },
            { id: "6120", name: "Lucians", slug: "lucians" },
        ],
        rating: 2045,
        peakRating: 2070,
        tier: "Diamond",
        games: 74,
        wins: 44,
        queuedAt: NOW - 22 * 60_000,
        rank: 9,
        ratingDelta: -3,
        rankDelta: 1,
    },
]

const meta = {
    title: "Views/Ranked queue",
    component: RankedQueueView,
    decorators: [withRouter],
    parameters: { layout: "padded" },
    args: { region: "all", now: NOW },
} satisfies Meta<typeof RankedQueueView>

export default meta
type Story = StoryObj<typeof meta>

export const Solo: Story = { args: { bracket: "1v1", rows: solo } }

export const Teams: Story = {
    args: { bracket: "2v2", region: "eu", rows: teams },
}

export const Empty: Story = { args: { bracket: "3v3", rows: [] } }
