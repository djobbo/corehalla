import type { Meta, StoryObj } from "@storybook/react-vite"
import { WeaponBubbleChart } from "./WeaponBubbleChart"
import type { Player, PlayerWeapon } from "@crh/api-contract/schemas"

const meta = {
    title: "Patterns/Weapon bubble chart",
    component: WeaponBubbleChart,
    parameters: { layout: "padded" },
} satisfies Meta<typeof WeaponBubbleChart>

export default meta
type Story = StoryObj<typeof meta>

const weapon = (
    name: string,
    stats: Partial<PlayerWeapon["stats"]>,
): PlayerWeapon => ({
    name,
    stats: {
        games: 0,
        wins: 0,
        kos: 0,
        damage_dealt: 0,
        time_held: 0,
        level: 10,
        xp: 0,
        ...stats,
    },
    legends: [],
})

const weapons: readonly PlayerWeapon[] = [
    weapon("Sword", {
        level: 28,
        time_held: 14200,
        kos: 388,
        damage_dealt: 96000,
        games: 168,
        wins: 92,
        xp: 51000,
    }),
    weapon("Axe", {
        level: 24,
        time_held: 11800,
        kos: 322,
        damage_dealt: 81000,
        games: 141,
        wins: 74,
        xp: 40000,
    }),
    weapon("Hammer", {
        level: 21,
        time_held: 9600,
        kos: 268,
        damage_dealt: 68000,
        games: 120,
        wins: 63,
        xp: 33000,
    }),
    weapon("Bow", {
        level: 19,
        time_held: 8100,
        kos: 214,
        damage_dealt: 57000,
        games: 104,
        wins: 55,
        xp: 27000,
    }),
    weapon("Gauntlets", {
        level: 17,
        time_held: 6800,
        kos: 186,
        damage_dealt: 49000,
        games: 88,
        wins: 47,
        xp: 21000,
    }),
    weapon("Katars", {
        level: 15,
        time_held: 5600,
        kos: 152,
        damage_dealt: 40000,
        games: 73,
        wins: 38,
        xp: 17000,
    }),
    weapon("Spear", {
        level: 13,
        time_held: 4400,
        kos: 118,
        damage_dealt: 32000,
        games: 59,
        wins: 30,
        xp: 13000,
    }),
    weapon("Scythe", {
        level: 11,
        time_held: 3200,
        kos: 88,
        damage_dealt: 24000,
        games: 44,
        wins: 21,
        xp: 9000,
    }),
    weapon("Blasters", {
        level: 10,
        time_held: 2100,
        kos: 58,
        damage_dealt: 16000,
        games: 31,
        wins: 14,
        xp: 6000,
    }),
    weapon("Cannon", {
        level: 9,
        time_held: 1200,
        kos: 34,
        damage_dealt: 9000,
        games: 20,
        wins: 9,
        xp: 3500,
    }),
]

const unarmed: Player["unarmed"] = {
    time_held: 6400,
    kos: 176,
    damage_dealt: 47000,
}

export const SeasonWeapons: Story = {
    args: { weapons, unarmed },
    render: (args) => (
        <div className="w-[520px] max-w-full">
            <WeaponBubbleChart {...args} />
        </div>
    ),
}

export const WithoutUnarmed: Story = {
    args: {
        weapons: weapons.slice(0, 5),
        unarmed: { time_held: 0, kos: 0, damage_dealt: 0 },
    },
    render: (args) => (
        <div className="w-[520px] max-w-full">
            <WeaponBubbleChart {...args} />
        </div>
    ),
}
