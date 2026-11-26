import type { Meta, StoryObj } from "@storybook/react-vite"
import { LadderView } from "./LadderView"
import { withMockApi } from "@/storybook/decorators"
import type { LadderRow } from "@/lib/ladderRows"

const meta = {
    title: "Views/Ladder view",
    component: LadderView,
    decorators: [withMockApi],
    parameters: { layout: "padded" },
} satisfies Meta<typeof LadderView>

export default meta
type Story = StoryObj<typeof meta>

const rows: readonly LadderRow[] = [
    {
        key: "mordex",
        rank: 1,
        rating: 2104,
        peakRating: 2180,
        tier: "Valhallan",
        games: 140,
        wins: 96,
        region: "us-e",
        members: [{ id: 1, name: "Mordex", slug: "mordex" }],
        legend: { name: "Bödvar", nameKey: "bodvar", href: "/legends/3-bdvar" },
    },
    {
        key: "sandstorm",
        rank: 2,
        rating: 2061,
        peakRating: 2100,
        tier: "Valhallan",
        games: 210,
        wins: 120,
        region: "eu",
        members: [{ id: 2, name: "Sandstorm", slug: "sandstorm" }],
        legend: {
            name: "Mirage",
            nameKey: "mirage",
            href: "/legends/33-mirage",
        },
    },
    {
        key: "duo",
        rank: 3,
        rating: 1988,
        peakRating: 2000,
        tier: "Diamond",
        games: 64,
        wins: 34,
        region: "brz",
        members: [
            { id: 3, name: "Boomie", slug: "boomie" },
            { id: 4, name: "Lucians", slug: "lucians" },
        ],
    },
    {
        key: "platinumbound",
        rank: 4,
        rating: 1200,
        peakRating: 1200,
        tier: "Platinum",
        games: 24,
        wins: 11,
        region: "jpn",
        members: [{ id: 5, name: "PlatinumBound", slug: "platinumbound" }],
    },
]

const updatedAt = Date.UTC(2026, 9, 15, 12, 0, 0)

export const Global: Story = {
    args: {
        bracket: "1v1",
        region: "all",
        page: 1,
        rows,
        hasNextPage: true,
        updatedAt,
    },
}

export const Filtered: Story = {
    args: {
        bracket: "1v1",
        region: "eu",
        page: 1,
        rows: rows.slice(0, 2),
        hasNextPage: false,
        updatedAt,
        player: "mor",
    },
}

export const Regional: Story = {
    args: {
        bracket: "2v2",
        region: "eu",
        page: 3,
        rows,
        hasNextPage: false,
        updatedAt,
    },
}

export const Empty: Story = {
    args: {
        bracket: "3v3",
        region: "jpn",
        page: 1,
        rows: [],
        hasNextPage: false,
        updatedAt,
    },
}
