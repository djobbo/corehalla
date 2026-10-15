import type { Meta, StoryObj } from "@storybook/react-vite"
import { SplitProgress } from "./SplitProgress"

const meta = {
    title: "Patterns/Split progress",
    component: SplitProgress,
    parameters: { layout: "padded" },
} satisfies Meta<typeof SplitProgress>

export default meta
type Story = StoryObj<typeof meta>

export const Full: Story = {
    args: {
        label: "Games by result",
        parts: [
            { key: "wins", value: 125, intent: "green" },
            { key: "losses", value: 89, intent: "orange" },
        ],
    },
}

export const WithRemainder: Story = {
    args: {
        label: "Season games played",
        parts: [{ key: "played", value: 40, intent: "blue" }],
        total: 100,
    },
}

export const Small: Story = {
    args: {
        label: "Regional split",
        size: "sm",
        parts: [
            { key: "eu", value: 62, intent: "cyan" },
            { key: "na", value: 48, intent: "pink" },
            { key: "other", value: 21, intent: "yellow" },
        ],
    },
}

export const Single: Story = {
    args: {
        label: "Wins",
        parts: [{ key: "wins", value: 12, intent: "green" }],
    },
}
