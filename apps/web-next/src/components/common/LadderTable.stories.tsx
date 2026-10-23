import type { Meta, StoryObj } from "@storybook/react-vite"
import { LadderTable } from "./LadderTable"
import { withRouter } from "@/storybook/decorators"
import type { LadderRow } from "@/lib/ladderRows"

const meta = {
    title: "Patterns/Ladder table",
    component: LadderTable,
    decorators: [withRouter],
    parameters: { layout: "padded" },
} satisfies Meta<typeof LadderTable>

export default meta
type Story = StoryObj<typeof meta>

const soloRows: readonly LadderRow[] = [
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
        key: "ldz",
        rank: 3,
        rating: 2017,
        tier: "Diamond",
        members: [{ id: 3, name: "LDZ", slug: "ldz" }],
    },
    {
        key: "freshlyplaced",
        rank: 412,
        rating: 1203,
        tier: "Unranked",
        members: [{ id: 4, name: "FreshlyPlaced", slug: "freshlyplaced" }],
    },
]

const duoRows: readonly LadderRow[] = [
    {
        key: "boomie-lucians",
        rank: 1,
        rating: 2091,
        tier: "Valhallan",
        members: [
            { id: 5, name: "Boomie", slug: "boomie" },
            { id: 6, name: "Lucians", slug: "lucians" },
        ],
    },
    {
        key: "sandstorm-bladewise",
        rank: 2,
        rating: 2044,
        tier: "Diamond",
        members: [
            { id: 7, name: "Sandstorm", slug: "sandstorm" },
            { id: 8, name: "Bladewise", slug: "bladewise" },
        ],
    },
    {
        key: "solo-phantom",
        rank: 3,
        rating: 1988,
        tier: "Platinum",
        members: [{ id: 9, name: "Esoteric", slug: "esoteric" }],
    },
]

export const Solo: Story = {
    args: { rows: soloRows },
}

export const Duo: Story = {
    args: { rows: duoRows },
}

export const Empty: Story = {
    args: { rows: [] },
}
