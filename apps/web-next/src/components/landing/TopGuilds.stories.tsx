import type { Meta, StoryObj } from "@storybook/react-vite"
import { withRouter } from "@/storybook/decorators"
import { landingGuildBoard } from "@/storybook/fixtures"
import { TopGuilds } from "./TopGuilds"

const meta = {
    title: "Features/Landing/Top guilds",
    component: TopGuilds,
    decorators: [withRouter],
    parameters: { layout: "padded" },
    args: { board: landingGuildBoard },
} satisfies Meta<typeof TopGuilds>

export default meta
type Story = StoryObj<typeof meta>

export const FullBoard: Story = {
    parameters: {
        docs: {
            description: {
                story: "The five strongest guilds of the first rankings page, ranked from one and keeping the board's XP order.",
            },
        },
    },
}

export const FewerThanFive: Story = {
    args: { board: landingGuildBoard.slice(0, 3) },
    parameters: {
        docs: {
            description: {
                story: "A thin board renders the rows it has and no filler.",
            },
        },
    },
}

export const Empty: Story = {
    args: { board: [] },
    parameters: {
        docs: {
            description: {
                story: "An empty board leaves no frame behind — the card is absent and the ladders beside it keep their place.",
            },
        },
    },
}
