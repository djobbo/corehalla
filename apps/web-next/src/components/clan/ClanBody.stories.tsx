import type { Meta, StoryObj } from "@storybook/react-vite"
import { ClanBody } from "./ClanBody"
import { withMockApi } from "@/storybook/decorators"
import {
    EMPTY_GUILD_ID,
    GUILD_ID,
    NO_POINTS_GUILD_ID,
    guildMock,
} from "@/storybook/fixtures"

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

/** No member reports points: contributors fall back to XP and the roster loses its points order. */
export const WithoutGuildPoints: Story = {
    args: { clanId: NO_POINTS_GUILD_ID },
}

export const EmptyRoster: Story = {
    args: { clanId: EMPTY_GUILD_ID },
}
