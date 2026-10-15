import type { Meta, StoryObj } from "@storybook/react-vite"
import { EmptyRankedCard, RankedCard } from "./RankedCard"

const meta = {
    title: "Features/Player/Ranked card",
    component: RankedCard,
    parameters: { layout: "padded" },
} satisfies Meta<typeof RankedCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {
        title: "Ranked 1v1",
        tier: "Diamond",
        region: "eu",
        rating: 1988,
        peakRating: 2104,
        wins: 214,
        games: 362,
    },
}

export const Valhallan: Story = {
    args: {
        title: "Solo queue",
        tier: "Valhallan",
        region: "us-e",
        rating: 2114,
        peakRating: 2180,
        wins: 96,
        games: 140,
    },
}

export const WithStats: Story = {
    args: {
        ...Default.args,
        stats: [
            { title: "Games", value: "362" },
            { title: "Winrate", value: "59.12%" },
            { title: "Elo reset", value: "1950 · Diamond" },
        ],
    },
}

export const NoTierOrRegion: Story = {
    args: {
        title: "Ranked 3v3",
        tier: null,
        region: null,
        rating: 1200,
        peakRating: 1200,
        wins: 3,
        games: 10,
    },
}

export const Empty: Story = {
    args: {
        title: "Ranked season",
        rating: 0,
        peakRating: 0,
        wins: 0,
        games: 0,
    },
    render: () => <EmptyRankedCard label="Not played in ranked this season." />,
}
