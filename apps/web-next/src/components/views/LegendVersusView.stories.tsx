import type { Meta, StoryObj } from "@storybook/react-vite"
import { LegendVersusView } from "./LegendVersusView"
import { withRouter } from "@/storybook/decorators"
import { legendsMap } from "@crh/bhapi/legends"
import type { LegendMeta, LegendMetaRow } from "@crh/api-contract/schemas"

const bodvar = legendsMap[3]
const cassidy = legendsMap[4]

const metaRow = (
    legendId: number,
    slug: string,
    overrides: Partial<Omit<LegendMetaRow, "legendId" | "slug">> = {},
): LegendMetaRow => ({
    legendId,
    slug,
    games: 9_400,
    wins: 4_794,
    winRate: 0.51,
    playShare: 0.1234,
    accounts: 9_400,
    playStyle: {
        accounts: 9_400,
        damageDealtPerGame: 410.25,
        damageTakenPerGame: 402.5,
        kosPerGame: 1.4,
        fallsPerGame: 1.18,
        suicidesPer100Games: 0.72,
        averageMatchSeconds: 208,
        weaponOneShare: 0.5833,
        weaponTwoShare: 0.4167,
    },
    ...overrides,
})

const fullMeta: LegendMeta = {
    data: [
        metaRow(bodvar.legend_id, "3-bdvar"),
        metaRow(cassidy.legend_id, "4-cassidy", {
            games: 12_800,
            wins: 6_272,
            winRate: 0.49,
            playShare: 0.168,
            accounts: 12_800,
            playStyle: {
                accounts: 12_800,
                damageDealtPerGame: 388.5,
                damageTakenPerGame: 421.75,
                kosPerGame: 1.22,
                fallsPerGame: 1.32,
                suicidesPer100Games: 0.91,
                averageMatchSeconds: 187,
                weaponOneShare: 0.6111,
                weaponTwoShare: 0.3889,
            },
        }),
    ],
    meta: { accounts: 128_400, ratingFloor: null },
}

const story = {
    title: "Views/Versus legends",
    component: LegendVersusView,
    decorators: [withRouter],
    parameters: { layout: "fullscreen" },
} satisfies Meta<typeof LegendVersusView>

export default story
type Story = StoryObj<typeof story>

export const TwoLegends: Story = {
    args: { a: bodvar, b: cassidy, meta: fullMeta },
    render: (args) => (
        <div className="ch-page">
            <LegendVersusView {...args} />
        </div>
    ),
}

export const OneSidePicked: Story = {
    args: { a: bodvar, b: null, meta: fullMeta },
    render: (args) => (
        <div className="ch-page">
            <LegendVersusView {...args} />
        </div>
    ),
    parameters: {
        docs: {
            description: {
                story: "Only one side is in the URL, so the view keeps both pickers and withholds the table.",
            },
        },
    },
}

export const NoMetaRow: Story = {
    args: {
        a: bodvar,
        b: cassidy,
        meta: {
            data: [metaRow(bodvar.legend_id, "3-bdvar")],
            meta: { accounts: 128_400, ratingFloor: null },
        },
    },
    render: (args) => (
        <div className="ch-page">
            <LegendVersusView {...args} />
        </div>
    ),
    parameters: {
        docs: {
            description: {
                story: "Cassidy has no row in the aggregate: her attributes still render and every meta metric reads as a dash.",
            },
        },
    },
}
