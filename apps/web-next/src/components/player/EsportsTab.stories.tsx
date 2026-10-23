import type { Meta, StoryObj } from "@storybook/react-vite"
import { EsportsTab } from "./EsportsTab"
import { withMockApi } from "@/storybook/decorators"
import {
    EMPTY_PLAYER_ID,
    PLAYER_ID,
    esportsMock,
    playerMock,
} from "@/storybook/fixtures"

const meta = {
    title: "Features/Player/Esports tab",
    component: EsportsTab,
    decorators: [withMockApi],
    parameters: {
        layout: "padded",
        mockApi: { ...playerMock, ...esportsMock },
    },
} satisfies Meta<typeof EsportsTab>

export default meta
type Story = StoryObj<typeof meta>

export const PowerRanked: Story = {
    args: { playerId: PLAYER_ID },
}

export const NoRecord: Story = {
    args: { playerId: EMPTY_PLAYER_ID },
}
