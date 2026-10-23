import type { Meta, StoryObj } from "@storybook/react-vite"
import { ClanRankIcon } from "./ClanRankIcon"

const meta = {
    title: "Features/Clan/Clan rank icon",
    component: ClanRankIcon,
    parameters: { layout: "centered" },
} satisfies Meta<typeof ClanRankIcon>

export default meta
type Story = StoryObj<typeof meta>

export const Leader: Story = {
    args: { rank: "Leader" },
}

export const Officer: Story = {
    args: { rank: "Officer" },
}

export const Member: Story = {
    args: { rank: "Member" },
}

export const Recruit: Story = {
    args: { rank: "Recruit" },
}
