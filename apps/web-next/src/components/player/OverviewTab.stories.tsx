import type { Meta, StoryObj } from "@storybook/react-vite"
import { OverviewTab } from "./OverviewTab"
import { withMockApi } from "@/storybook/decorators"

const meta = {
    title: "Features/Player/Overview tab",
    component: OverviewTab,
    decorators: [withMockApi],
    parameters: { layout: "padded" },
} satisfies Meta<typeof OverviewTab>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: { playerId: 4242 },
}

export const Empty: Story = {
    args: { playerId: 4243 },
}
