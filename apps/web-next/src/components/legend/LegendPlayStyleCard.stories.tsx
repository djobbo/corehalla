import type { Meta, StoryObj } from "@storybook/react-vite"
import { LegendPlayStyleCard } from "./LegendPlayStyleCard"
import { legendsMap } from "@crh/bhapi/legends"

const meta = {
    title: "Features/Legend/Legend play style",
    component: LegendPlayStyleCard,
    parameters: { layout: "padded" },
    args: {
        legend: legendsMap[3],
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
            damageSplit: {
                weaponOne: 0.541,
                weaponTwo: 0.219,
                unarmed: 0.15,
                gadgets: 0.06,
                thrownItem: 0.03,
            },
        },
    },
} satisfies Meta<typeof LegendPlayStyleCard>

export default meta
type Story = StoryObj<typeof meta>

export const Populated: Story = {}

export const NoWeaponSplit: Story = {
    args: {
        playStyle: {
            accounts: 214,
            damageDealtPerGame: 388.5,
            damageTakenPerGame: 402.1,
            kosPerGame: 1.1,
            fallsPerGame: 1.15,
            suicidesPer100Games: 0.47,
            averageMatchSeconds: 187,
            weaponOneShare: null,
            weaponTwoShare: null,
            damageSplit: {
                weaponOne: 0.482,
                weaponTwo: 0.3,
                unarmed: 0.13,
                gadgets: 0.055,
                thrownItem: 0.033,
            },
        },
    },
    parameters: {
        docs: {
            description: {
                story: "No indexed row reported held weapon time, so the held-time split is omitted rather than drawn as an empty bar; the damage split still renders.",
            },
        },
    },
}

export const NoDamageSplit: Story = {
    args: {
        playStyle: {
            accounts: 640,
            damageDealtPerGame: 404.2,
            damageTakenPerGame: 396.8,
            kosPerGame: 1.28,
            fallsPerGame: 1.09,
            suicidesPer100Games: 0.58,
            averageMatchSeconds: 202,
            weaponOneShare: 0.6111,
            weaponTwoShare: 0.3889,
            damageSplit: {
                weaponOne: null,
                weaponTwo: null,
                unarmed: null,
                gadgets: null,
                thrownItem: null,
            },
        },
    },
    parameters: {
        docs: {
            description: {
                story: "No indexed row attributed damage to a source, so the damage split reads as a dash while the held-time split keeps rendering.",
            },
        },
    },
}

export const EmptySample: Story = {
    args: {
        playStyle: {
            accounts: 3,
            damageDealtPerGame: null,
            damageTakenPerGame: null,
            kosPerGame: null,
            fallsPerGame: null,
            suicidesPer100Games: null,
            averageMatchSeconds: null,
            weaponOneShare: null,
            weaponTwoShare: null,
            damageSplit: {
                weaponOne: null,
                weaponTwo: null,
                unarmed: null,
                gadgets: null,
                thrownItem: null,
            },
        },
    },
    parameters: {
        docs: {
            description: {
                story: "Three indexed accounts with no play-style totals: every metric reads as absent and the sample stays visible.",
            },
        },
    },
}
