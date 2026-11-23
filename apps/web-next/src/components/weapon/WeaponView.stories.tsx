import type { Meta, StoryObj } from "@storybook/react-vite"
import { WeaponView } from "./WeaponView"
import { withRouter } from "@/storybook/decorators"
import type { CareerRanking } from "@crh/api-contract/schemas"

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

const meta = {
    title: "Features/Weapon/Weapon view",
    component: WeaponView,
    decorators: [withRouter],
    parameters: { layout: "padded" },
    args: { weapon: "Gauntlets", rows },
} satisfies Meta<typeof WeaponView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const NoPlayers: Story = {
    args: { rows: [] },
}
