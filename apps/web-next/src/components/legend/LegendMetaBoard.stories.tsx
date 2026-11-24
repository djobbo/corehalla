import type { Meta, StoryObj } from "@storybook/react-vite"
import { LegendMetaBoard } from "./LegendMetaBoard"
import type { LegendMeta } from "@crh/api-contract/schemas"

const populated: LegendMeta = {
    data: [
        {
            legendId: 3,
            slug: "3-bdvar",
            games: 4_218_400,
            wins: 2_193_568,
            winRate: 0.52,
            playShare: 0.1342,
            accounts: 5_128,
        },
        {
            legendId: 6,
            slug: "6-lord-vraxx",
            games: 3_611_800,
            wins: 1_833_591,
            winRate: 0.5077,
            playShare: 0.1149,
            accounts: 4_870,
        },
        {
            legendId: 4,
            slug: "4-cassidy",
            games: 2_602_100,
            wins: 1_353_092,
            winRate: 0.52,
            playShare: 0.0828,
            accounts: 3_942,
        },
        {
            legendId: 5,
            slug: "5-orion",
            games: 1_986_300,
            wins: 953_424,
            winRate: 0.48,
            playShare: 0.0632,
            accounts: 3_114,
        },
        {
            legendId: 7,
            slug: "7-gnash",
            games: 940_500,
            wins: 497_045,
            winRate: 0.5285,
            playShare: 0.0299,
            accounts: 2_208,
        },
    ],
    meta: { accounts: 18_204, ratingFloor: 1800 },
}

const meta = {
    title: "Features/Legend/Meta board",
    component: LegendMetaBoard,
    parameters: { layout: "padded" },
    args: {
        board: populated,
        floor: "1800",
        onFloorChange() {},
    },
} satisfies Meta<typeof LegendMetaBoard>

export default meta
type Story = StoryObj<typeof meta>

export const Populated: Story = {}

export const Empty: Story = {
    args: {
        board: { data: [], meta: { accounts: 0, ratingFloor: 2200 } },
        floor: "2200",
    },
    parameters: {
        docs: {
            description: {
                story: "No indexed games clear the 2200+ floor: the board names the filter rather than showing bare columns.",
            },
        },
    },
}
