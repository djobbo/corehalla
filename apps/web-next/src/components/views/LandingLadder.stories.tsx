import type { Meta, StoryObj } from "@storybook/react-vite"
import { LandingLadder } from "./LandingLadder"
import { withRouter } from "@/storybook/decorators"
import type { LadderRow } from "@/lib/ladderRows"

const rows: readonly LadderRow[] = [
    {
        key: "mordex",
        rank: 1,
        rating: 2104,
        tier: "Valhallan",
        members: [{ id: 1456, name: "Mordex", slug: "mordex" }],
    },
    {
        key: "sandstorm",
        rank: 2,
        rating: 2061,
        tier: "Diamond",
        members: [{ id: 2087, name: "Sandstorm", slug: "sandstorm" }],
    },
    {
        key: "boomie",
        rank: 3,
        rating: 1988,
        tier: "Diamond",
        members: [{ id: 5312, name: "Boomie", slug: "boomie" }],
    },
    {
        key: "lucians",
        rank: 4,
        rating: 1975,
        tier: "Diamond",
        members: [{ id: 6120, name: "Lucians", slug: "lucians" }],
    },
    {
        key: "sandstorm-duo",
        rank: 5,
        rating: 1930,
        tier: "Diamond",
        members: [
            { id: 2087, name: "Sandstorm", slug: "sandstorm" },
            { id: 1456, name: "Mordex", slug: "mordex" },
        ],
    },
    {
        key: "freshlyplaced",
        rank: 6,
        rating: 1200,
        tier: "Unranked",
        members: [{ id: 9001, name: "FreshlyPlaced", slug: "freshlyplaced" }],
    },
]

const meta = {
    title: "Views/Landing ladder",
    component: LandingLadder,
    decorators: [withRouter],
    parameters: { layout: "padded" },
} satisfies Meta<typeof LandingLadder>

export default meta
type Story = StoryObj<typeof meta>

export const Preview: Story = { args: { bracket: "1v1", rows } }

export const Short: Story = {
    args: { bracket: "2v2", rows: rows.slice(0, 3) },
}

export const Empty: Story = { args: { bracket: "3v3", rows: [] } }
