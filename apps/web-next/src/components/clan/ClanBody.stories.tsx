import type { Meta, StoryObj } from "@storybook/react-vite"
import { ClanBody } from "./ClanBody"
import { withMockApi } from "@/storybook/decorators"
import { EMPTY_GUILD_ID, GUILD_ID, guildMock } from "@/storybook/fixtures"

const meta = {
    title: "Features/Clan/Clan body",
    component: ClanBody,
    decorators: [withMockApi],
    parameters: { layout: "padded", mockApi: guildMock },
} satisfies Meta<typeof ClanBody>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: { clanId: GUILD_ID },
}

export const EmptyRoster: Story = {
    args: { clanId: EMPTY_GUILD_ID },
}
