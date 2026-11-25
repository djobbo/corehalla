import type { Meta, StoryObj } from "@storybook/react-vite"
import { LegendMetaCard } from "./LegendMetaCard"
import { withRouter } from "@/storybook/decorators"
import type { LegendMeta, LegendMetaRow } from "@crh/api-contract/schemas"

const playStyle = {
    accounts: 4_870,
    damageDealtPerGame: 412.75,
    damageTakenPerGame: 401.32,
    kosPerGame: 1.42,
    fallsPerGame: 1.21,
    suicidesPer100Games: 0.82,
    averageMatchSeconds: 208,
    weaponOneShare: 0.5833,
    weaponTwoShare: 0.4167,
    damageSplit: {
        weaponOne: 0.62,
        weaponTwo: 0.21,
        unarmed: 0.1,
        gadgets: 0.04,
        thrownItem: 0.03,
    },
} as const

const row = (
    legendId: number,
    over: Partial<LegendMetaRow> = {},
): LegendMetaRow => ({
    legendId,
    slug: `${legendId}-legend`,
    games: 2_602_100,
    wins: 1_353_092,
    winRate: 0.52,
    playShare: 0.0828,
    accounts: 3_942,
    playStyle,
    ...over,
})

const board: LegendMeta = {
    data: [
        row(3, {
            games: 4_218_400,
            wins: 2_193_568,
            playShare: 0.1342,
            accounts: 5_128,
        }),
        row(6, {
            games: 3_611_800,
            wins: 1_833_591,
            winRate: 0.5077,
            playShare: 0.1149,
            accounts: 4_870,
            playStyle: { ...playStyle, damageDealtPerGame: 438.1 },
        }),
        row(4, { playStyle: { ...playStyle, averageMatchSeconds: 194 } }),
    ],
    meta: { accounts: 18_204, ratingFloor: 1800 },
}

const meta = {
    title: "Features/Legend/Meta card",
    component: LegendMetaCard,
    decorators: [withRouter],
    parameters: { layout: "padded" },
    args: {
        meta: board,
        legendId: 3,
        floor: "1800",
        onFloorChange() {},
    },
} satisfies Meta<typeof LegendMetaCard>

export default meta
type Story = StoryObj<typeof meta>

export const Populated: Story = {}

export const NoPlayStyle: Story = {
    args: {
        meta: {
            ...board,
            data: board.data.map((entry) =>
                entry.legendId === 3
                    ? {
                          ...entry,
                          playStyle: {
                              ...entry.playStyle,
                              damageDealtPerGame: null,
                              averageMatchSeconds: null,
                          },
                      }
                    : entry,
            ),
        },
    },
    parameters: {
        docs: {
            description: {
                story: "No play-style sample for this legend: damage per game and average match read as absent and carry no position, while the board-wide metrics still rank.",
            },
        },
    },
}

export const NotOnBoard: Story = {
    args: {
        meta: {
            ...board,
            data: board.data.filter((entry) => entry.legendId !== 3),
        },
    },
    parameters: {
        docs: {
            description: {
                story: "The legend is missing from the board: the sample line stays and every metric reads as a dash instead of a position.",
            },
        },
    },
}

export const NoBoard: Story = {
    args: { meta: null },
    parameters: {
        docs: {
            description: {
                story: "The meta read failed or is still in flight: the card is absent and the rest of the page renders unchanged.",
            },
        },
    },
}
