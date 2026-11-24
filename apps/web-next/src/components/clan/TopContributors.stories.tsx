import type { Meta, StoryObj } from "@storybook/react-vite"
import { TopContributors } from "./TopContributors"
import { withRouter } from "@/storybook/decorators"
import {
    emptyRosterGuildEnvelope,
    guildEnvelope,
    noPointsGuildEnvelope,
} from "@/storybook/fixtures"

const meta = {
    title: "Features/Clan/Top contributors",
    component: TopContributors,
    decorators: [withRouter],
    parameters: { layout: "padded" },
} satisfies Meta<typeof TopContributors>

export default meta
type Story = StoryObj<typeof meta>

export const Populated: Story = {
    args: { members: guildEnvelope.data.members },
}

/** No member reports points, so the ranking falls back to clan XP. */
export const XpFallback: Story = {
    args: { members: noPointsGuildEnvelope.data.members },
}

export const Empty: Story = {
    args: { members: emptyRosterGuildEnvelope.data.members },
}
