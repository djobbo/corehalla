import type { Meta, StoryObj } from "@storybook/react-vite"
import { WeaponView } from "./WeaponView"
import { withRouter } from "@/storybook/decorators"
import type { CareerRanking, WeaponMeta } from "@crh/api-contract/schemas"

const rows: readonly CareerRanking[] = [
    {
        id: "1456",
        name: "Mordex",
        slug: "1456-mordex",
        tier: "Valhallan",
        rating: 2104,
        region: "us-e",
        peakRating: 2150,
        prop: 14_562,
    },
    {
        id: "2087",
        name: "Sandstorm",
        slug: "2087-sandstorm",
        tier: "Diamond",
        rating: 2061,
        region: "us-e",
        peakRating: 2099,
        prop: 12_190,
    },
    {
        id: "5312",
        name: "Boomie",
        slug: "5312-boomie",
        tier: "Diamond",
        rating: 1988,
        region: "eu",
        peakRating: 2020,
        prop: 9_884,
    },
]

const meta: WeaponMeta = {
    data: [
        {
            weapon: "Sword",
            games: 4_218_400,
            wins: 2_193_568,
            winRate: 0.52,
            playShare: 0.1342,
            accounts: 5_128,
            damagePerGame: 318.4,
            timeHeldPerGame: 96.2,
            kosPerGame: 0.94,
        },
        {
            weapon: "Gauntlets",
            games: 3_611_800,
            wins: 1_833_591,
            winRate: 0.5077,
            playShare: 0.1149,
            accounts: 4_870,
            damagePerGame: 340.7,
            timeHeldPerGame: 88.4,
            kosPerGame: 1.02,
        },
        {
            weapon: "Bow",
            games: 2_602_100,
            wins: 1_353_092,
            winRate: 0.52,
            playShare: 0.0828,
            accounts: 3_942,
            damagePerGame: 301.2,
            timeHeldPerGame: 104.8,
            kosPerGame: 0.88,
        },
        {
            weapon: "Axe",
            games: 1_986_300,
            wins: 953_424,
            winRate: 0.48,
            playShare: 0.0632,
            accounts: 3_114,
            damagePerGame: 352.9,
            timeHeldPerGame: 91.5,
            kosPerGame: 1.11,
        },
        {
            weapon: "Scythe",
            games: 940_500,
            wins: 497_045,
            winRate: 0.5285,
            playShare: 0.0299,
            accounts: 2_208,
            damagePerGame: 296.3,
            timeHeldPerGame: 98.7,
            kosPerGame: 0.91,
        },
    ],
    meta: { accounts: 12_480, ratingFloor: null },
}

const story = {
    title: "Features/Weapon/Weapon view",
    component: WeaponView,
    decorators: [withRouter],
    parameters: { layout: "padded" },
    args: { weapon: "Gauntlets", rows, meta },
} satisfies Meta<typeof WeaponView>

export default story
type Story = StoryObj<typeof story>

export const Default: Story = {}

export const NoPlayers: Story = {
    args: { rows: [] },
}

export const WithoutMeta: Story = {
    args: { meta: null },
    parameters: {
        docs: {
            description: {
                story: "The aggregate could not answer inside the section deadline: the Meta card is dropped and the rest of the weapon page renders normally.",
            },
        },
    },
}
