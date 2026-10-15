import type { Meta, StoryObj } from "@storybook/react-vite"
import { MemberCard } from "./MemberCard"
import { withRouter } from "@/storybook/decorators"
import type { GuildMember } from "@crh/api-contract/schemas"

const meta = {
    title: "Features/Clan/Member card",
    component: MemberCard,
    decorators: [withRouter],
    parameters: { layout: "padded" },
} satisfies Meta<typeof MemberCard>

export default meta
type Story = StoryObj<typeof meta>

const member: GuildMember = {
    id: 4242,
    name: "Mordex",
    slug: "mordex",
    rank: "Leader",
    joined_at: 1_690_000_000,
    xp: 4_820_000,
    guild_points: 12_400,
}

const clanXp = 12_400_000

export const Leader: Story = {
    args: { member, clanXp },
}

export const Recruit: Story = {
    args: {
        member: {
            ...member,
            id: 7,
            name: "",
            slug: "recruit-7",
            rank: "Recruit",
            joined_at: 1_750_000_000,
            xp: 120_000,
        },
        clanXp,
    },
}
