import type { Meta, StoryObj } from "@storybook/react-vite"
import { ClanHeader } from "./ClanHeader"
import { withMockApi } from "@/storybook/decorators"
import { GUILD_ID, NO_POINTS_GUILD_ID, guildMock } from "@/storybook/fixtures"

const meta = {
    title: "Features/Clan/Clan header",
    component: ClanHeader,
    decorators: [withMockApi],
    parameters: { layout: "padded", mockApi: guildMock },
} satisfies Meta<typeof ClanHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: { clanId: GUILD_ID },
}

export const NoGuildPoints: Story = {
    args: { clanId: NO_POINTS_GUILD_ID },
}
