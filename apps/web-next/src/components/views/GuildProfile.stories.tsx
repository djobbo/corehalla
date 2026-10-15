import type { Meta, StoryObj } from "@storybook/react-vite"
import { ProfileLayout } from "@/components/layout/ProfileLayout"
import { ClanHeader } from "@/components/clan/ClanHeader"
import { ClanBody } from "@/components/clan/ClanBody"
import { withMockApi } from "@/storybook/decorators"
import { GUILD_ID, guildMock } from "@/storybook/fixtures"

/**
 * The guild page the route renders — the baseline the player page is held to.
 */
const meta = {
    title: "Views/Guild profile",
    decorators: [withMockApi],
    parameters: { layout: "fullscreen", mockApi: guildMock },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    render: () => (
        <ProfileLayout aside={<ClanHeader clanId={GUILD_ID} />}>
            <ClanBody clanId={GUILD_ID} />
        </ProfileLayout>
    ),
}
