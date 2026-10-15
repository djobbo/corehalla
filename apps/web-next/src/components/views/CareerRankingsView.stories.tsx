import type { Meta, StoryObj } from "@storybook/react-vite"
import { CareerRankingsView } from "./CareerRankingsView"
import { withRouter } from "@/storybook/decorators"
import type {
    CareerRanking,
    SortablePlayerProp,
} from "@crh/api-contract/schemas"

const sorts: readonly {
    readonly value: SortablePlayerProp
    readonly label: string
}[] = [
    { value: "xp", label: "Account XP" },
    { value: "games", label: "Games" },
    { value: "wins", label: "Wins" },
    { value: "rankedGames", label: "Ranked games" },
]

const rows: readonly CareerRanking[] = [
    {
        id: "1456",
        name: "Mordex",
        slug: "mordex",
        tier: "Valhallan",
        rating: 2104,
        region: "us-e",
        peakRating: 2150,
        prop: 14_562_300,
    },
    {
        id: "2087",
        name: "Sandstorm",
        slug: "sandstorm",
        tier: "Diamond",
        rating: 2061,
        region: "us-e",
        peakRating: 2099,
        prop: 12_190_450,
    },
    {
        id: "5312",
        name: "Boomie",
        slug: "boomie",
        tier: "Diamond",
        rating: 1988,
        region: "eu",
        peakRating: 2020,
        prop: 9_884_100,
    },
]

const meta = {
    title: "Views/Career rankings",
    component: CareerRankingsView,
    decorators: [withRouter],
    parameters: { layout: "padded" },
    args: {
        sortBy: "xp",
        sorts,
        metric: {
            label: "Account XP",
            format: (value: number) => value.toLocaleString(),
        },
        rankOffset: 0,
        onSortChange: () => undefined,
    },
} satisfies Meta<typeof CareerRankingsView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { rows } }

export const SecondPage: Story = {
    args: {
        rows,
        rankOffset: 50,
        prevHref: "/rankings/career/players/1",
        nextHref: "/rankings/career/players/3",
    },
}

export const Empty: Story = { args: { rows: [] } }
