import type { Meta, StoryObj } from "@storybook/react-vite"
import { Breakdown } from "./Breakdown"

const meta = {
    title: "Patterns/Breakdown",
    component: Breakdown,
    parameters: { layout: "padded" },
} satisfies Meta<typeof Breakdown>

export default meta
type Story = StoryObj<typeof meta>

export const WinsLosses: Story = {
    args: {
        title: "games",
        total: 214,
        entries: [
            { key: "wins", label: "Wins", value: 125, intent: "green" },
            { key: "losses", label: "Losses", value: 89, intent: "orange" },
        ],
    },
}

export const Partial: Story = {
    args: {
        title: "ranked games",
        total: 40,
        max: 100,
        entries: [{ key: "1v1", label: "1v1", value: 40, intent: "blue" }],
    },
}

export const Single: Story = {
    args: {
        title: "games",
        total: 12,
        entries: [{ key: "wins", label: "Wins", value: 12, intent: "green" }],
    },
}
