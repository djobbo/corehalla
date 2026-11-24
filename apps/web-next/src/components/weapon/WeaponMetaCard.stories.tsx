import type { Meta, StoryObj } from "@storybook/react-vite"
import { WeaponMetaCard } from "./WeaponMetaCard"
import type { WeaponMeta } from "@crh/api-contract/schemas"

const populated: WeaponMeta = {
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
    meta: { accounts: 12_480 },
}

const meta = {
    title: "Features/Weapon/Meta card",
    component: WeaponMetaCard,
    parameters: { layout: "padded" },
    args: { meta: populated, weapon: "Gauntlets" },
} satisfies Meta<typeof WeaponMetaCard>

export default meta
type Story = StoryObj<typeof meta>

export const Populated: Story = {}

export const Omitted: Story = {
    args: { weapon: "Chakram" },
    parameters: {
        docs: {
            description: {
                story: "The sample has no games on this weapon, so the card renders nothing rather than empty or fabricated figures.",
            },
        },
    },
}
