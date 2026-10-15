import type { Meta, StoryObj } from "@storybook/react-vite"
import { WeaponsTab } from "./WeaponsTab"
import { withMockApi } from "@/storybook/decorators"

const meta = {
    title: "Features/Player/Weapons tab",
    component: WeaponsTab,
    decorators: [withMockApi],
    parameters: { layout: "padded" },
} satisfies Meta<typeof WeaponsTab>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: { playerId: 4242 },
}

export const Empty: Story = {
    args: { playerId: 4243 },
}
