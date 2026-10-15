import type { Meta, StoryObj } from "@storybook/react-vite"
import { PlayerHeader } from "./PlayerHeader"
import { registerMockRoute, withMockApi } from "@/storybook/decorators"

/**
 * Player-profile fixtures for the `player` and `clan` stories. They register
 * with the shared `withMockApi` mock, which layers these routes on top of its
 * account reads and suspends while the atom settles.
 */

const updatedAt = Date.UTC(2026, 9, 15, 12, 0, 0)

const ranked = (
    rating: number,
    peak_rating: number,
    wins: number,
    games: number,
) => ({ rating, peak_rating, wins, games, tier: "Diamond", rating_reset: 1950 })

const legend = (
    id: number,
    name: string,
    legendRanked: ReturnType<typeof ranked> | null,
) => ({
    id,
    name,
    name_key: name.replace(/\s/g, ""),
    slug: name.toLowerCase(),
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
    ranked: legendRanked,
})

const team = (
    partner: { id: number; name: string; slug: string },
    overrides: Partial<{
        rating: number
        peak_rating: number
        tier: string
        wins: number
        games: number
    }> = {},
) => ({
    team: [{ id: 4242, name: "Mordex", slug: "mordex" }, partner],
    paired: true,
    rating: 2010,
    peak_rating: 2065,
    tier: "Diamond",
    wins: 154,
    games: 260,
    region: "eu",
    rating_reset: 1950,
    ...overrides,
})

export const playerEnvelope = {
    data: {
        id: 4242,
        name: "Mordex",
        slug: "mordex",
        aliases: ["MordexTheWolf", "Sandstorm•2"],
        stats: {
            xp: 12_400_000,
            level: 84,
            xp_percentage: 41,
            games: 8_420,
            wins: 4_910,
            matchtime: 984_000,
            kos: 31_200,
            falls: 27_400,
            suicides: 820,
            team_kos: 410,
            damage_dealt: 8_120_000,
            damage_taken: 7_640_000,
        },
        ranked: {
            stats: {
                games: 362,
                wins: 214,
                peak_rating: 2104,
                glory: { from_wins: 1200, from_peak_rating: 900, total: 2100 },
            },
            "1v1": {
                rating: 1988,
                peak_rating: 2104,
                is_placement_matches: false,
                tier: "Diamond",
                wins: 214,
                games: 362,
                region: "eu",
                rating_reset: 1950,
            },
            "2v2": {
                games: 380,
                wins: 214,
                average_rating: 1950,
                average_peak_rating: 1998,
                teams: [
                    team({ id: 2, name: "Sandstorm", slug: "sandstorm" }),
                    team(
                        { id: 3, name: "Boomie", slug: "boomie" },
                        {
                            rating: 1890,
                            peak_rating: 1930,
                            tier: "Platinum",
                            wins: 60,
                            games: 120,
                        },
                    ),
                ],
            },
            "3v3": null,
        },
        clan: {
            id: 42,
            name: "Wolfpack",
            slug: "wolfpack",
            xp: 4_200_000,
            personal_xp: 380_000,
            rank: "Officer",
            joined_at: 1_700_000_000,
            created_at: 1_600_000_000,
            members_count: 14,
        },
        unarmed: { damage_dealt: 320_000, kos: 2_400, time_held: 190_000 },
        weapon_throws: { damage_dealt: 88_000, kos: 0 },
        gadgets: {
            kos: 1_100,
            damage_dealt: 210_000,
            bomb: { damage_dealt: 90_000, kos: 500 },
            mine: { damage_dealt: 70_000, kos: 350 },
            spikeball: null,
            sidekick: null,
            snowball: { hits: 120, kos: 40 },
        },
        weapons: [
            {
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
            },
            {
                name: "Scythe",
                stats: {
                    games: 2_140,
                    wins: 1_240,
                    kos: 7_600,
                    damage_dealt: 1_040_000,
                    time_held: 288_000,
                    level: 48,
                    xp: 1_600_000,
                },
                legends: [
                    {
                        id: 12,
                        name: "Mordex",
                        slug: "mordex",
                        kos: 7_600,
                        damage_dealt: 1_040_000,
                        time_held: 288_000,
                    },
                ],
            },
        ],
        legends: [
            legend(12, "Mordex", ranked(1988, 2104, 214, 362)),
            legend(34, "Ragnir", null),
            legend(99, "Queen Nai", null),
        ],
        weapon_kos: 13_400,
        thrown_kos: 420,
        weapon_damage: 1_910_000,
    },
    meta: { updated_at: updatedAt },
}

/** No ranked, no clan, empty roster — the component's empty branches. */
export const emptyPlayerEnvelope = {
    data: {
        id: 4243,
        name: "FreshlyPlaced",
        slug: "freshlyplaced",
        aliases: [],
        stats: {
            xp: 12_000,
            level: 4,
            xp_percentage: 10,
            games: 0,
            wins: 0,
            matchtime: 0,
            kos: 0,
            falls: 0,
            suicides: 0,
            team_kos: 0,
            damage_dealt: 0,
            damage_taken: 0,
        },
        ranked: null,
        clan: null,
        unarmed: { damage_dealt: 0, kos: 0, time_held: 0 },
        weapon_throws: { damage_dealt: 0, kos: 0 },
        gadgets: {
            kos: 0,
            damage_dealt: 0,
            bomb: null,
            mine: null,
            spikeball: null,
            sidekick: null,
            snowball: null,
        },
        weapons: [],
        legends: [],
        weapon_kos: 0,
        thrown_kos: 0,
        weapon_damage: 0,
    },
    meta: { updated_at: updatedAt },
}

registerMockRoute("/api/v1/players/4242", playerEnvelope)
registerMockRoute("/api/v1/players/4243", emptyPlayerEnvelope)

const meta = {
    title: "Features/Player/Player header",
    component: PlayerHeader,
    decorators: [withMockApi],
    parameters: { layout: "padded" },
    excludeStories: /Envelope$/,
} satisfies Meta<typeof PlayerHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: { playerId: 4242 },
}

export const Empty: Story = {
    args: { playerId: 4243 },
}
