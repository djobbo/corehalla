import type { Meta, StoryObj } from "@storybook/react-vite"
import { WeaponRow } from "./WeaponRow"
import type { PlayerLegend, PlayerWeapon } from "@crh/api-contract/schemas"

const meta = {
    title: "Features/Player/Weapon row",
    component: WeaponRow,
    parameters: { layout: "padded" },
} satisfies Meta<typeof WeaponRow>

export default meta
type Story = StoryObj<typeof meta>

const stats = (overrides: Partial<PlayerLegend["stats"]> = {}) => ({
    xp: 2_100_000,
    level: 55,
    xp_percentage: 40,
    damage_dealt: 1_120_000,
    damage_taken: 980_000,
    kos: 9_400,
    falls: 8_100,
    suicides: 220,
    team_kos: 140,
    matchtime: 300_000,
    games: 1_900,
    wins: 1_100,
    ...overrides,
})

const legend = (
    id: number,
    name: string,
    nameKey: string,
    overrides: Partial<PlayerLegend["stats"]> = {},
    ranked: PlayerLegend["ranked"] = {
        rating: 1988,
        peak_rating: 2104,
        tier: "Diamond",
        wins: 214,
        games: 362,
        rating_reset: 1950,
    },
): PlayerLegend => ({
    id,
    name,
    name_key: nameKey,
    slug: name.toLowerCase(),
    stats: stats(overrides),
    weapon_one: { name: "Gauntlets", damage_dealt: 0, kos: 0, time_held: 0 },
    weapon_two: { name: "Scythe", damage_dealt: 0, kos: 0, time_held: 0 },
    unarmed: { damage_dealt: 0, kos: 0, time_held: 0 },
    gadgets: { damage_dealt: 0, kos: 0 },
    weapon_throws: { damage_dealt: 0, kos: 0 },
    ranked,
})

const gauntlets: PlayerWeapon = {
    name: "Gauntlets",
    stats: {
        games: 3_820,
        wins: 2_270,
        kos: 13_400,
        damage_dealt: 1_910_000,
        time_held: 512_000,
        level: 55,
        xp: 2_100_000,
    },
    legends: [
        {
            id: 12,
            name: "Mordex",
            slug: "mordex",
            kos: 9_400,
            damage_dealt: 1_120_000,
            time_held: 300_000,
        },
        {
            id: 34,
            name: "Ragnir",
            slug: "ragnir",
            kos: 4_000,
            damage_dealt: 790_000,
            time_held: 212_000,
        },
    ],
}

const rankedLegends = new Map<number, PlayerLegend>([
    [12, legend(12, "Mordex", "Mordex")],
    [34, legend(34, "Ragnir", "Ragnir", { games: 640 }, null)],
])

const casualLegends = new Map<number, PlayerLegend>([
    [12, legend(12, "Mordex", "Mordex", {}, null)],
    [34, legend(34, "Ragnir", "Ragnir", {}, null)],
])

const rankedArgs = {
    weapon: gauntlets,
    legends: rankedLegends,
    rank: 1,
    matchtime: 984_000,
    games: 8_420,
    display: "1w 1h 32m 0s",
}

export const Ranked: Story = {
    args: rankedArgs,
}

export const NoRankedLegends: Story = {
    args: { ...rankedArgs, legends: casualLegends, rank: 2 },
}
