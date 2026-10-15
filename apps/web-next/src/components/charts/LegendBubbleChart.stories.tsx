import type { Meta, StoryObj } from "@storybook/react-vite"
import { LegendBubbleChart } from "./LegendBubbleChart"
import type { PlayerLegend } from "@crh/api-contract/schemas"

const meta = {
    title: "Patterns/Legend bubble chart",
    component: LegendBubbleChart,
    parameters: { layout: "padded" },
} satisfies Meta<typeof LegendBubbleChart>

export default meta
type Story = StoryObj<typeof meta>

const legend = (
    id: number,
    name: string,
    stats: Partial<PlayerLegend["stats"]>,
): PlayerLegend => ({
    id,
    name,
    name_key: name.toLowerCase(),
    slug: `${id}-${name.toLowerCase()}`,
    stats: {
        xp: 0,
        level: 10,
        xp_percentage: 0,
        damage_dealt: 0,
        damage_taken: 0,
        kos: 0,
        falls: 0,
        suicides: 0,
        team_kos: 0,
        matchtime: 0,
        games: 0,
        wins: 0,
        ...stats,
    },
    weapon_one: { name: "Sword", damage_dealt: 0, kos: 0, time_held: 0 },
    weapon_two: { name: "Spear", damage_dealt: 0, kos: 0, time_held: 0 },
    unarmed: { damage_dealt: 0, kos: 0, time_held: 0 },
    gadgets: { damage_dealt: 0, kos: 0 },
    weapon_throws: { damage_dealt: 0, kos: 0 },
    ranked: null,
})

const unplayed = legend(99, "Queen Nai", { level: 7, games: 0 })

const legends: readonly PlayerLegend[] = [
    legend(3, "Bödvar", {
        level: 34,
        matchtime: 18240,
        kos: 512,
        damage_dealt: 128400,
        games: 214,
        wins: 125,
        xp: 64000,
    }),
    legend(12, "Mordex", {
        level: 31,
        matchtime: 15980,
        kos: 448,
        damage_dealt: 112300,
        games: 188,
        wins: 104,
        xp: 58000,
    }),
    legend(20, "Diana", {
        level: 27,
        matchtime: 12310,
        kos: 366,
        damage_dealt: 92100,
        games: 151,
        wins: 79,
        xp: 44000,
    }),
    legend(27, "Nix", {
        level: 23,
        matchtime: 9870,
        kos: 300,
        damage_dealt: 76400,
        games: 122,
        wins: 66,
        xp: 33000,
    }),
    legend(41, "Val", {
        level: 19,
        matchtime: 7450,
        kos: 240,
        damage_dealt: 58800,
        games: 96,
        wins: 49,
        xp: 22000,
    }),
    legend(55, "Scarlet", {
        level: 16,
        matchtime: 5120,
        kos: 168,
        damage_dealt: 41200,
        games: 71,
        wins: 38,
        xp: 15000,
    }),
    legend(63, "Teros", {
        level: 14,
        matchtime: 3980,
        kos: 141,
        damage_dealt: 33400,
        games: 57,
        wins: 27,
        xp: 11000,
    }),
    legend(70, "Asuri", {
        level: 12,
        matchtime: 2740,
        kos: 96,
        damage_dealt: 22100,
        games: 41,
        wins: 22,
        xp: 8000,
    }),
    legend(84, "Jhala", {
        level: 10,
        matchtime: 1830,
        kos: 64,
        damage_dealt: 14700,
        games: 30,
        wins: 15,
        xp: 5000,
    }),
    legend(90, "Kor", {
        level: 9,
        matchtime: 960,
        kos: 33,
        damage_dealt: 7900,
        games: 18,
        wins: 8,
        xp: 3000,
    }),
    unplayed,
]

export const SeasonRoster: Story = {
    args: { legends },
    render: (args) => (
        <div className="w-[520px] max-w-full">
            <LegendBubbleChart {...args} />
        </div>
    ),
}

export const UnplayedLegendsDropped: Story = {
    args: { legends: legends.slice(0, 4).concat(unplayed) },
    render: (args) => (
        <div className="w-[520px] max-w-full">
            <LegendBubbleChart {...args} />
        </div>
    ),
}
