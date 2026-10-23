import type { Meta, StoryObj } from "@storybook/react-vite"
import { TeamCard } from "./TeamCard"
import { withRouter } from "@/storybook/decorators"
import type { PlayerRankedTeam } from "@crh/api-contract/schemas"

const meta = {
    title: "Features/Player/Team card",
    component: TeamCard,
    decorators: [withRouter],
    parameters: { layout: "padded" },
} satisfies Meta<typeof TeamCard>

export default meta
type Story = StoryObj<typeof meta>

const team: PlayerRankedTeam = {
    team: [
        { id: 1, name: "Mordex", slug: "mordex" },
        { id: 2, name: "Sandstorm", slug: "sandstorm" },
    ],
    paired: true,
    rating: 2010,
    peak_rating: 2065,
    tier: "Diamond",
    wins: 154,
    games: 260,
    region: "eu",
    rating_reset: 1950,
}

export const Default: Story = {
    args: { team },
}

export const NoRegion: Story = {
    args: {
        team: {
            ...team,
            region: null,
            tier: null,
            rating: 1720,
            peak_rating: 1801,
            wins: 40,
            games: 88,
        },
    },
}
