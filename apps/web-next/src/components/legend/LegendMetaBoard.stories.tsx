import type { Meta, StoryObj } from "@storybook/react-vite"
import { LegendMetaBoard } from "./LegendMetaBoard"
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

const populated: LegendMeta = {
    data: [
        row(3, {
            games: 4_218_400,
            wins: 2_193_568,
            playShare: 0.1342,
            accounts: 5_128,
            playStyle: {
                ...playStyle,
                damageDealtPerGame: 438.1,
                averageMatchSeconds: 194,
                suicidesPer100Games: 0.64,
            },
        }),
        row(6, {
            games: 3_611_800,
            wins: 1_833_591,
            winRate: 0.5077,
            playShare: 0.1149,
            accounts: 4_870,
            playStyle: {
                ...playStyle,
                damageDealtPerGame: 401.4,
                averageMatchSeconds: 221,
                suicidesPer100Games: 1.08,
            },
        }),
        row(4, {
            playShare: 0.0828,
            playStyle: {
                ...playStyle,
                damageDealtPerGame: 356.2,
                averageMatchSeconds: 186,
                suicidesPer100Games: 0.51,
            },
        }),
        row(5, {
            games: 1_986_300,
            wins: 953_424,
            winRate: 0.48,
            playShare: 0.0632,
            accounts: 3_114,
            playStyle: {
                ...playStyle,
                damageDealtPerGame: 376.9,
                averageMatchSeconds: 228,
                suicidesPer100Games: 1.34,
            },
        }),
        row(7, {
            games: 940_500,
            wins: 497_045,
            winRate: 0.5285,
            playShare: 0.0299,
            accounts: 2_208,
            playStyle: {
                ...playStyle,
                damageDealtPerGame: 421.6,
                averageMatchSeconds: 174,
                suicidesPer100Games: 0.47,
            },
        }),
    ],
    meta: { accounts: 18_204, ratingFloor: 1800 },
}

const mixed: LegendMeta = {
    data: populated.data.map((entry) => {
        if (entry.legendId === 6) {
            return {
                ...entry,
                playStyle: {
                    ...entry.playStyle,
                    damageDealtPerGame: null,
                    suicidesPer100Games: null,
                },
            }
        }

        if (entry.legendId === 5) {
            return {
                ...entry,
                playStyle: { ...entry.playStyle, averageMatchSeconds: null },
            }
        }

        return entry
    }),
    meta: populated.meta,
}

const meta = {
    title: "Features/Legend/Meta board",
    component: LegendMetaBoard,
    decorators: [withRouter],
    parameters: { layout: "padded" },
    args: {
        board: populated,
        floor: "1800",
        weapon: "all",
        onFloorChange() {},
        onWeaponChange() {},
    },
} satisfies Meta<typeof LegendMetaBoard>

export default meta
type Story = StoryObj<typeof meta>

export const Populated: Story = {
    parameters: {
        docs: {
            description: {
                story: "The full board: play share, win rate, damage dealt per game, average match length, suicides per 100 games and games. Sorting opens on play share, highest first, and offers every metric. The download control beside the floor chips saves these rows in this order as corehalla-legends-1800.csv.",
            },
        },
    },
}

export const MixedNulls: Story = {
    args: { board: mixed },
    parameters: {
        docs: {
            description: {
                story: "Lord Vraxx has no damage or suicide denominator and Orion no match-length denominator: each cell reads as an em dash, and each row sorts behind the legends that report the metric. Below `sm` the low-value columns fold into the line under the legend name.",
            },
        },
    },
}

export const WeaponSelected: Story = {
    args: { weapon: "Grapple Hammer" },
    parameters: {
        docs: {
            description: {
                story: "A weapon is selected: only the legends carrying it in either slot stay on the board, the line under the title names the weapon and how much of the board it keeps, and the download saves just these rows. Sorting still applies within the filtered set.",
            },
        },
    },
}

export const WeaponWithoutMatches: Story = {
    args: { weapon: "Katars" },
    parameters: {
        docs: {
            description: {
                story: "No legend on this board carries Katars: the board names the weapon and the floor instead of rendering an empty table, and the weapon selector stays reachable so the visitor can widen the filter again.",
            },
        },
    },
}

export const Empty: Story = {
    args: {
        board: { data: [], meta: { accounts: 0, ratingFloor: 2200 } },
        floor: "2200",
    },
    parameters: {
        docs: {
            description: {
                story: "No indexed games clear the 2200+ floor: the board names the filter rather than showing bare columns, and there is nothing to download so the control is absent.",
            },
        },
    },
}
