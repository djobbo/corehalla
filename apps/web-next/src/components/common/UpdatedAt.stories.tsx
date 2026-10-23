import type { Meta, StoryObj } from "@storybook/react-vite"
import { UpdatedAt } from "./UpdatedAt"

const meta = {
    title: "Patterns/Updated at",
    component: UpdatedAt,
    parameters: { layout: "padded" },
} satisfies Meta<typeof UpdatedAt>

export default meta
type Story = StoryObj<typeof meta>

const now = Date.UTC(2026, 9, 15, 12, 0, 0)

export const JustNow: Story = {
    args: { at: now },
}

export const MinutesAgo: Story = {
    args: { at: now - 42 * 60_000 },
}

export const HoursAgo: Story = {
    args: { at: now - 5 * 3_600_000 },
}

export const DaysAgo: Story = {
    args: { at: now - 3 * 86_400_000 },
}
