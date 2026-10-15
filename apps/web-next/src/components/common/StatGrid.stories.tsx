import type { Meta, StoryObj } from "@storybook/react-vite"
import { StatGrid } from "./StatGrid"

const meta = {
    title: "Patterns/Stat grid",
    component: StatGrid,
    parameters: { layout: "padded" },
} satisfies Meta<typeof StatGrid>

export default meta
type Story = StoryObj<typeof meta>

const stats = [
    { title: "Rating", value: "1,842" },
    { title: "Peak", value: "1,904", hint: "Highest rating this season" },
    { title: "Games", value: "214" },
    { title: "Win rate", value: "58.4%" },
] as const

export const FourColumns: Story = {
    args: { stats, maxColumns: 4 },
}

export const ThreeColumns: Story = {
    args: { stats: stats.slice(0, 3), maxColumns: 3 },
}

export const TwoColumns: Story = {
    args: { stats: stats.slice(0, 2), maxColumns: 2 },
}
