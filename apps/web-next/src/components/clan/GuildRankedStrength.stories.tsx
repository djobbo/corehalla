import type { Meta, StoryObj } from "@storybook/react-vite"
import { GuildRankedStrength } from "./GuildRankedStrength"
import {
    emptyRosterGuildEnvelope,
    guildEnvelope,
    unratedGuildEnvelope,
} from "@/storybook/fixtures"

const meta = {
    title: "Features/Clan/Ranked strength",
    component: GuildRankedStrength,
    parameters: { layout: "padded" },
} satisfies Meta<typeof GuildRankedStrength>

export default meta
type Story = StoryObj<typeof meta>

/** Three rated members across three buckets, one recruit outside the index. */
export const Populated: Story = {
    args: { members: guildEnvelope.data.members },
}

/** Nobody on the roster has a ranked record: no average, one unrated row. */
export const AllUnrated: Story = {
    args: { members: unratedGuildEnvelope.data.members },
}

/** A single rated member still gets an average and a one-bucket distribution. */
export const SingleRated: Story = {
    args: {
        members: guildEnvelope.data.members.map((member, index) => ({
            ...member,
            ranked: index === 0 ? member.ranked : null,
        })),
    },
}

export const EmptyRoster: Story = {
    args: { members: emptyRosterGuildEnvelope.data.members },
}
