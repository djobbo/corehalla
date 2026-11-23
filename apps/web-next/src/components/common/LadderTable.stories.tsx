import type { Meta, StoryObj } from "@storybook/react-vite"
import { LadderTable } from "./LadderTable"
import { withMockApi } from "@/storybook/decorators"
import type { LadderRow } from "@/lib/ladderRows"

const meta = {
    title: "Patterns/Ladder table",
    component: LadderTable,
    decorators: [withMockApi],
    parameters: { layout: "padded" },
} satisfies Meta<typeof LadderTable>

export default meta
type Story = StoryObj<typeof meta>

const soloRows: readonly LadderRow[] = [
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
        tier: "Diamond",
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
        key: "ldz",
        rank: 3,
        rating: 2017,
        peakRating: 2090,
        tier: "Diamond",
        games: 88,
        wins: 44,
        region: "brz",
        members: [{ id: 3, name: "LDZ", slug: "ldz" }],
        legend: {
            name: "Hattori",
            nameKey: "hattori",
            href: "/legends/10-hattori",
        },
    },
    {
        key: "freshlyplaced",
        rank: 412,
        rating: 1203,
        peakRating: 1203,
        tier: "Unranked",
        games: 0,
        wins: 0,
        region: "sea",
        members: [{ id: 4, name: "FreshlyPlaced", slug: "freshlyplaced" }],
    },
]

const duoRows: readonly LadderRow[] = [
    {
        key: "boomie-lucians",
        rank: 1,
        rating: 2091,
        peakRating: 2150,
        tier: "Valhallan",
        games: 143,
        wins: 123,
        region: "us-e",
        members: [
            { id: 5, name: "Boomie", slug: "boomie" },
            { id: 6, name: "Lucians", slug: "lucians" },
        ],
    },
    {
        key: "sandstorm-bladewise",
        rank: 2,
        rating: 2044,
        peakRating: 2101,
        tier: "Diamond",
        games: 90,
        wins: 50,
        region: "eu",
        members: [
            { id: 7, name: "Sandstorm", slug: "sandstorm" },
            { id: 8, name: "Bladewise", slug: "bladewise" },
        ],
    },
    {
        key: "solo-phantom",
        rank: 3,
        rating: 1988,
        peakRating: 2000,
        tier: "Platinum",
        games: 12,
        wins: 5,
        region: "jpn",
        members: [{ id: 9, name: "Esoteric", slug: "esoteric" }],
    },
]

export const Solo: Story = {
    args: { rows: soloRows, variant: "compact" },
}

export const Duo: Story = {
    args: { rows: duoRows, variant: "compact" },
}

export const Full: Story = {
    args: { rows: [...soloRows, duoRows[0]], variant: "full" },
}

export const Empty: Story = {
    args: { rows: [], variant: "compact" },
}
