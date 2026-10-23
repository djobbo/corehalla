import type { Meta, StoryObj } from "@storybook/react-vite"
import { WeaponsTab } from "./WeaponsTab"
import { withMockApi } from "@/storybook/decorators"
import { EMPTY_PLAYER_ID, PLAYER_ID, playerMock } from "@/storybook/fixtures"

const meta = {
    title: "Features/Player/Weapons tab",
    component: WeaponsTab,
    decorators: [withMockApi],
    parameters: { layout: "padded", mockApi: playerMock },
} satisfies Meta<typeof WeaponsTab>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: { playerId: PLAYER_ID },
}

export const Empty: Story = {
    args: { playerId: EMPTY_PLAYER_ID },
}
