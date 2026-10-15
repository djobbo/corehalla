import type { Meta, StoryObj } from "@storybook/react-vite"
import { LegendsTab } from "./LegendsTab"
import { withMockApi } from "@/storybook/decorators"

const meta = {
    title: "Features/Player/Legends tab",
    component: LegendsTab,
    decorators: [withMockApi],
    parameters: { layout: "padded" },
} satisfies Meta<typeof LegendsTab>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: { playerId: 4242 },
}

export const Empty: Story = {
    args: { playerId: 4243 },
}
