import type { Meta, StoryObj } from "@storybook/react-vite"
import { ProfileLayout } from "@/components/layout/ProfileLayout"
import { PlayerHeader } from "@/components/player/PlayerHeader"
import { PlayerTabs } from "@/components/player/PlayerTabs"
import { OverviewTab } from "@/components/player/OverviewTab"
import { TeamsTab } from "@/components/player/TeamsTab"
import { withMockApi } from "@/storybook/decorators"
import { PLAYER_ID, playerMock } from "@/storybook/fixtures"
import type { ReactNode } from "react"

/**
 * The real player page: the composition the route renders. Stories here check
 * the header, the tab strip and a tab body together, at the width the
 * `ProfileLayout` page column actually produces.
 */
const meta = {
    title: "Views/Player profile",
    decorators: [withMockApi],
    parameters: { layout: "fullscreen", mockApi: playerMock },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const page = (body: ReactNode) => (
    <ProfileLayout aside={<PlayerHeader playerId={PLAYER_ID} />}>
        <PlayerTabs slug="mordex" show2v2 />
        <div className="mt-4">{body}</div>
    </ProfileLayout>
)

export const Overview: Story = {
    render: () => page(<OverviewTab playerId={PLAYER_ID} />),
}

export const Teams: Story = {
    render: () => page(<TeamsTab playerId={PLAYER_ID} />),
}
