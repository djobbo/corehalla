import type { Meta, StoryObj } from "@storybook/react-vite"
import { LegendRow } from "./LegendRow"
import type { PlayerLegend } from "@crh/api-contract/schemas"

const meta = {
    title: "Features/Player/Legend row",
    component: LegendRow,
    parameters: { layout: "padded" },
} satisfies Meta<typeof LegendRow>

export default meta
type Story = StoryObj<typeof meta>

const rankedLegend: PlayerLegend = {
    id: 12,
    name: "Mordex",
    name_key: "Mordex",
    slug: "mordex",
    stats: {
        xp: 4_820_000,
        level: 78,
        xp_percentage: 62,
        damage_dealt: 3_410_000,
        damage_taken: 2_980_000,
        kos: 24_600,
        falls: 21_300,
        suicides: 640,
        team_kos: 310,
        matchtime: 984_000,
        games: 3_820,
        wins: 2_270,
    },
    weapon_one: {
        name: "Gauntlets",
        damage_dealt: 1_910_000,
        kos: 13_400,
        time_held: 512_000,
    },
    weapon_two: {
        name: "Scythe",
        damage_dealt: 1_380_000,
        kos: 10_100,
        time_held: 402_000,
    },
    unarmed: { damage_dealt: 120_000, kos: 1_100, time_held: 70_000 },
    gadgets: { damage_dealt: 64_000, kos: 420 },
    weapon_throws: { damage_dealt: 28_000, kos: 0 },
    ranked: {
        rating: 1988,
        peak_rating: 2104,
        tier: "Diamond",
        wins: 214,
        games: 362,
        rating_reset: 1950,
    },
}

const unrankedLegend: PlayerLegend = {
    ...rankedLegend,
    id: 34,
    name: "Ragnir",
    name_key: "Ragnir",
    slug: "ragnir",
    stats: {
        ...rankedLegend.stats,
        xp: 240_000,
        level: 21,
        games: 180,
        wins: 96,
        matchtime: 42_000,
    },
    weapon_one: { name: "Katars", damage_dealt: 0, kos: 0, time_held: 0 },
    weapon_two: { name: "Axe", damage_dealt: 0, kos: 0, time_held: 0 },
    ranked: null,
}

export const Ranked: Story = {
    args: {
        legend: rankedLegend,
        rank: 1,
        matchtime: 984_000,
        games: 3_820,
        display: "Level 78 · 4,820,000 xp",
    },
}

export const Unranked: Story = {
    args: {
        legend: unrankedLegend,
        rank: 2,
        matchtime: 984_000,
        games: 3_820,
        display: "Level 21 · 240,000 xp",
    },
}
