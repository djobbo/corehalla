import type { Meta, StoryObj } from "@storybook/react-vite"
import { ClanBody } from "./ClanBody"
import { registerMockRoute, withMockApi } from "@/storybook/decorators"
import { emptyRosterGuildEnvelope, guildEnvelope } from "./ClanHeader.stories"

registerMockRoute("/api/v1/guilds/4242", guildEnvelope)
registerMockRoute("/api/v1/guilds/4244", emptyRosterGuildEnvelope)

const meta = {
    title: "Features/Clan/Clan body",
    component: ClanBody,
    decorators: [withMockApi],
    parameters: { layout: "padded" },
} satisfies Meta<typeof ClanBody>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: { clanId: 4242 },
}

export const EmptyRoster: Story = {
    args: { clanId: 4244 },
}
