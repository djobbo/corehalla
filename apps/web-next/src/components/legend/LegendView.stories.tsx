import type { Meta, StoryObj } from "@storybook/react-vite"
import { LegendView } from "./LegendView"
import { withRouter } from "@/storybook/decorators"
import { legendsMap } from "@crh/bhapi/legends"
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
    title: "Features/Legend/Legend view",
    component: LegendView,
    decorators: [withRouter],
    parameters: { layout: "padded" },
    args: { legend: legendsMap[3], rows },
} satisfies Meta<typeof LegendView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithPlayStyle: Story = {
    args: {
        playStyle: {
            accounts: 12_480,
            damageDealtPerGame: 412.75,
            damageTakenPerGame: 401.32,
            kosPerGame: 1.42,
            fallsPerGame: 1.21,
            suicidesPer100Games: 0.82,
            averageMatchSeconds: 208,
            weaponOneShare: 0.5833,
            weaponTwoShare: 0.4167,
        },
    },
}

export const NoMains: Story = {
    args: { rows: [] },
}
