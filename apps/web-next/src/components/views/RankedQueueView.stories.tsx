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

const mover = (
    id: string,
    name: string,
    rating: number,
    ratingDelta: number,
    rankDelta = 0,
    games = 120,
    wins = 70,
): QueuedEntry => ({
    id,
    members: [{ id, name, slug: name.toLowerCase() }],
    rating,
    peakRating: rating + 20,
    tier: "Diamond",
    games,
    wins,
    queuedAt: NOW - 3 * 60_000,
    rank: 10,
    ratingDelta,
    rankDelta,
})

const movers: readonly QueuedEntry[] = [
    {
        id: "mordex-sandstorm",
        members: [
            { id: "1456", name: "Mordex", slug: "mordex" },
            { id: "2087", name: "Sandstorm", slug: "sandstorm" },
        ],
        rating: 2210,
        peakRating: 2231,
        tier: "Valhallan",
        games: 96,
        wins: 61,
        queuedAt: NOW - 4 * 60_000,
        rank: 2,
        ratingDelta: 18,
        rankDelta: -4,
    },
    mover("boomie", "Boomie", 2148, 9, -1, 128, 77),
    mover("lucians", "Lucians", 2120, 9, 0, 128, 70),
    mover("diana", "Diana", 2094, 4, 1, 112, 60),
    mover("hattori", "Hattori", 2081, 2, -1, 88, 44),
    mover("koji", "Koji", 2069, 1, 0, 12, 5),
    mover("xull", "Xull", 2103, -11, 3, 41, 18),
    mover("asuri", "Asuri", 1996, -3, 0, 7, 2),
    mover("cassidy", "Cassidy", 1982, -1, 2, 0, 0),
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

export const Highlights: Story = {
    args: { bracket: "2v2", rows: movers },
}

export const DropsOnly: Story = {
    args: {
        bracket: "1v1",
        rows: [
            mover("xull", "Xull", 2103, -11, 3),
            mover("asuri", "Asuri", 1996, -3),
            mover("cassidy", "Cassidy", 1982, -1, 2),
        ],
    },
}

export const NoMovement: Story = {
    args: {
        bracket: "1v1",
        rows: [
            mover("boomie", "Boomie", 2148, 0),
            mover("lucians", "Lucians", 2120, 0),
            mover("diana", "Diana", 2094, 0),
        ],
    },
}

export const UnplayedSession: Story = {
    args: {
        bracket: "1v1",
        rows: [
            mover("koji", "Koji", 2069, 6, -1, 0, 0),
            mover("diana", "Diana", 2094, 0, 0, 4, 3),
            mover("hattori", "Hattori", 2081, -2, 1, 2, 0),
        ],
    },
}

export const Narrow: Story = {
    args: { bracket: "2v2", rows: movers },
    globals: { viewport: "phone390" },
    parameters: {
        viewport: {
            options: {
                phone390: {
                    name: "Phone (390px)",
                    styles: { width: "390px", height: "844px" },
                    type: "mobile",
                },
            },
        },
    },
}
