import type { Meta, StoryObj } from "@storybook/react-vite"
import { LadderView } from "./LadderView"
import { withRouter } from "@/storybook/decorators"
import type { LadderRow } from "@/lib/ladderRows"

const meta = {
    title: "Views/Ladder view",
    component: LadderView,
    decorators: [withRouter],
    parameters: { layout: "padded" },
} satisfies Meta<typeof LadderView>

export default meta
type Story = StoryObj<typeof meta>

const rows: readonly LadderRow[] = [
    {
        key: "mordex",
        rank: 1,
        rating: 2104,
        tier: "Valhallan",
        members: [{ id: 1, name: "Mordex", slug: "mordex" }],
    },
    {
        key: "sandstorm",
        rank: 2,
        rating: 2061,
        tier: "Diamond",
        members: [{ id: 2, name: "Sandstorm", slug: "sandstorm" }],
    },
    {
        key: "duo",
        rank: 3,
        rating: 1988,
        tier: "Diamond",
        members: [
            { id: 3, name: "Boomie", slug: "boomie" },
            { id: 4, name: "Lucians", slug: "lucians" },
        ],
    },
    {
        key: "unranked",
        rank: 4,
        rating: 1200,
        tier: "Unranked",
        members: [{ id: 5, name: "FreshlyPlaced", slug: "freshlyplaced" }],
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
