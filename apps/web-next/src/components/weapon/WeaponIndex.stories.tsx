import type { Meta, StoryObj } from "@storybook/react-vite"
import { WeaponIndex } from "./WeaponIndex"
import { withRouter } from "@/storybook/decorators"
import type { WeaponMeta, WeaponMetaRow } from "@/lib/weaponMeta"
import type { Weapon } from "@crh/bhapi/constants"

const row = (
    weapon: Weapon,
    playShare: number,
    damagePerGame: number,
    timeHeldPerGame: number,
    kosPerGame: number,
): WeaponMetaRow => ({
    weapon,
    games: 402_000,
    wins: 205_000,
    winRate: 0.5099,
    playShare,
    accounts: 2_140,
    damagePerGame,
    timeHeldPerGame,
    kosPerGame,
})

const populated: WeaponMeta = {
    data: [
        row("Sword", 0.1204, 318.4, 96.2, 0.94),
        row("Gauntlets", 0.1122, 340.7, 88.4, 1.02),
        row("Spear", 0.1033, 314.8, 93.1, 0.96),
        row("Bow", 0.0983, 301.2, 104.8, 0.88),
        row("Blasters", 0.0925, 322.7, 91.8, 0.99),
        row("Scythe", 0.0927, 296.3, 98.7, 0.91),
        row("Katars", 0.0861, 326.9, 90.7, 1.01),
        row("Axe", 0.0793, 352.9, 91.5, 1.11),
        row("Rocket Lance", 0.066, 339.5, 88.4, 1.02),
        row("Grapple Hammer", 0.048, 331.2, 84.6, 0.97),
        row("Cannon", 0.048, 348.1, 87.2, 1.08),
        row("Orb", 0.0377, 305.6, 95.4, 0.93),
        row("Greatsword", 0.0364, 333.9, 99.6, 1.04),
        row("Battle Boots", 0.0323, 327.4, 92.3, 0.98),
        row("Chakram", 0.0201, 298.8, 101.2, 0.89),
    ],
    meta: { accounts: 12_480 },
}

const mixed: WeaponMeta = {
    data: populated.data
        .filter((entry) => entry.weapon !== "Chakram")
        .map((entry) => {
            if (entry.weapon === "Scythe") return { ...entry, kosPerGame: null }
            if (entry.weapon === "Bow") {
                return {
                    ...entry,
                    damagePerGame: null,
                    timeHeldPerGame: null,
                }
            }

            return entry
        }),
    meta: populated.meta,
}

const meta = {
    title: "Features/Weapon/Weapon index",
    component: WeaponIndex,
    decorators: [withRouter],
    parameters: { layout: "padded" },
    args: { meta: populated },
} satisfies Meta<typeof WeaponIndex>

export default meta
type Story = StoryObj<typeof meta>

export const Full: Story = {}

export const MixedNulls: Story = {
    args: { meta: mixed },
    parameters: {
        docs: {
            description: {
                story: "Bow has no damage or time-held denominator, Scythe no KOs denominator, and Chakram no meta row at all: each renders as an em dash and sorts behind the weapons that have a value.",
            },
        },
    },
}

export const Empty: Story = {
    args: { meta: { data: [], meta: { accounts: 0 } } },
    parameters: {
        docs: {
            description: {
                story: "The index has no weapon games yet: the page names the gap instead of showing a table of dashes.",
            },
        },
    },
}

export const Unavailable: Story = {
    args: { meta: null },
    parameters: {
        docs: {
            description: {
                story: "The meta read failed or has not settled: the plain catalogue still lists every weapon with the legends that wield it.",
            },
        },
    },
}
