import type { Meta, StoryObj } from "@storybook/react-vite"
import { TeamsTab } from "./TeamsTab"
import { withMockApi } from "@/storybook/decorators"

const meta = {
    title: "Features/Player/Teams tab",
    component: TeamsTab,
    decorators: [withMockApi],
    parameters: { layout: "padded" },
} satisfies Meta<typeof TeamsTab>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: { playerId: 4242 },
}

export const Empty: Story = {
    args: { playerId: 4243 },
}
