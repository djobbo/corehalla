import type { Meta, StoryObj } from "@storybook/react-vite"
import { ClanRankingsView } from "./ClanRankingsView"
import { withRouter } from "@/storybook/decorators"
import type { ClanRanking } from "@crh/api-contract/schemas"

const rows: readonly ClanRanking[] = [
    {
        id: "101",
        name: "Wolfpack",
        slug: "wolfpack",
        nameLower: "wolfpack",
        created: Date.UTC(2019, 4, 1) / 1000,
        xp: 2_450_000,
    },
    {
        id: "202",
        name: "Nova Empire",
        slug: "nova-empire",
        nameLower: "nova empire",
        created: Date.UTC(2020, 8, 12) / 1000,
        xp: 1_980_500,
    },
    {
        id: "303",
        name: "Ashen Circle",
        slug: "ashen-circle",
        nameLower: "ashen circle",
        created: null,
        xp: 1_204_300,
    },
]

const meta = {
    title: "Views/Clan rankings",
    component: ClanRankingsView,
    decorators: [withRouter],
    parameters: { layout: "padded" },
    args: {
        query: "",
        onQueryChange: () => undefined,
        resultQuery: "",
        rankOffset: 0,
    },
} satisfies Meta<typeof ClanRankingsView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { rows } }

export const SearchResults: Story = {
    args: {
        rows: rows.slice(0, 1),
        query: "wolf",
        resultQuery: "wolf",
        rankOffset: null,
    },
}

export const Empty: Story = {
    args: { rows: [], query: "zzz", resultQuery: "zzz" },
}
