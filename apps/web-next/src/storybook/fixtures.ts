/**
 * API fixtures for the data-driven stories, shaped to the schemas the atoms
 * decode. Stories pass the relevant map as `parameters.mockApi`; see
 * `withMockApi` in `./decorators`.
 *
 * The `*Envelope` values are JSON bodies, so field names mirror the wire format.
 * Where a value drives an asset lookup (legend `name_key`, weapon `name`,
 * region) it has to match the real filename — the icons are lowercase and
 * space-separated, e.g. `queen nai.png`.
 */

const UPDATED_AT = Date.UTC(2026, 9, 15, 12, 0, 0)

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
    name_key: name.toLowerCase(),
    slug: name.toLowerCase().replace(/\s/g, ""),
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
                            tier: "Platinum 1",
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
    meta: { updated_at: UPDATED_AT },
}

/** No ranked, no clan, empty roster — the component's empty branches. */
export const emptyPlayerEnvelope = {
    data: {
        ...playerEnvelope.data,
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
    meta: { updated_at: UPDATED_AT },
}

const members = [
    {
        id: 4242,
        name: "Mordex",
        slug: "mordex",
        rank: "Leader",
        joined_at: 1_690_000_000,
        xp: 4_820_000,
        guild_points: 12_400,
    },
    {
        id: 2,
        name: "Sandstorm",
        slug: "sandstorm",
        rank: "Officer",
        joined_at: 1_695_000_000,
        xp: 3_900_000,
        guild_points: 9_800,
    },
    {
        id: 3,
        name: "Boomie",
        slug: "boomie",
        rank: "Member",
        joined_at: 1_700_000_000,
        xp: 2_100_000,
        guild_points: 4_200,
    },
    {
        id: 4,
        name: "FreshlyPlaced",
        slug: "freshlyplaced",
        rank: "Recruit",
        joined_at: 1_750_000_000,
        xp: 120_000,
        guild_points: 0,
    },
]

export const guildEnvelope = {
    data: {
        id: 4242,
        name: "Wolfpack",
        slug: "wolfpack",
        created_at: 1_600_000_000,
        xp: 12_400_000,
        level: 42,
        xp_percentage: 63.5,
        lifetime_xp: 40_000_000,
        guild_points: 26_400,
        members,
    },
    meta: { updated_at: UPDATED_AT },
}

/** Both guild-point sources unreported — the header falls back to "—". */
export const noPointsGuildEnvelope = {
    data: {
        ...guildEnvelope.data,
        id: 4243,
        name: "Empty Den",
        slug: "empty-den",
        guild_points: null,
        members: members.map((member) => ({
            id: member.id,
            name: member.name,
            slug: member.slug,
            rank: member.rank,
            joined_at: member.joined_at,
            xp: member.xp,
        })),
    },
    meta: { updated_at: UPDATED_AT },
}

/** No roster — the header still renders, the body shows its empty grid. */
export const emptyRosterGuildEnvelope = {
    data: {
        ...guildEnvelope.data,
        id: 4244,
        name: "New Bloods",
        slug: "new-bloods",
        xp: 12_000,
        level: 1,
        xp_percentage: 4,
        lifetime_xp: null,
        guild_points: null,
        members: [],
    },
    meta: { updated_at: UPDATED_AT },
}

export const esportsEnvelope = {
    data: {
        identity: {
            esportsId: 501,
            fullName: "Marcus Lindqvist",
            pronoun: null,
            sggPlayerId: 123456,
            cmPlayerId: null,
            twitter: "mordex",
            twitch: "mordex",
            country: "SE",
        },
        pr: {
            "1v1": {
                top8: 4,
                top32: 9,
                gold: 3,
                silver: 2,
                bronze: 1,
                powerRanking: 6,
                region: "EU",
            },
            "2v2": {
                top8: 2,
                top32: 5,
                gold: 1,
                silver: 1,
                bronze: 0,
                powerRanking: 12,
                region: "EU",
            },
        },
        recentLegend: { name: "Mordex", count: 12 },
        teammates: [
            {
                brawlhallaId: 2,
                name: "Sandstorm",
                slug: "sandstorm",
                games: 48,
                lastTeamedDate: 1_750_000_000,
            },
            {
                brawlhallaId: null,
                name: "Unknown Duo",
                slug: null,
                games: 6,
                lastTeamedDate: 1_700_000_000,
            },
        ],
        placements: {
            "1v1": [
                {
                    placement: 1,
                    tournamentId: "t1",
                    tournamentName: "Autumn Championship",
                    eventName: "Main Event",
                    year: 2026,
                    isOfficial: true,
                    isTwos: false,
                    isOnline: false,
                    startTime: 1_750_000_000,
                    host: "Brawlhalla",
                },
                {
                    placement: 5,
                    tournamentId: "t2",
                    tournamentName: "Summer Cup",
                    eventName: null,
                    year: 2026,
                    isOfficial: true,
                    isTwos: false,
                    isOnline: true,
                    startTime: 1_740_000_000,
                    host: null,
                },
            ],
            "2v2": [
                {
                    placement: 3,
                    tournamentId: "t3",
                    tournamentName: "Winter Doubles",
                    eventName: "Finals",
                    year: 2025,
                    isOfficial: true,
                    isTwos: true,
                    isOnline: false,
                    startTime: 1_730_000_000,
                    host: "Brawlhalla",
                },
            ],
        },
    },
    meta: { updated_at: UPDATED_AT },
}

const emptyEsportsEnvelope = {
    data: {
        identity: null,
        pr: { "1v1": null, "2v2": null },
        recentLegend: null,
        teammates: [],
        placements: { "1v1": [], "2v2": [] },
    },
    meta: { updated_at: UPDATED_AT },
}

/** Player ids used across the player and clan stories. */
export const PLAYER_ID = 4242
export const EMPTY_PLAYER_ID = 4243

/** Guild ids used across the clan stories. */
export const GUILD_ID = 4242
export const NO_POINTS_GUILD_ID = 4243
export const EMPTY_GUILD_ID = 4244

/** `parameters.mockApi` maps, one per feature. */
export const playerMock = {
    [`/api/v1/players/${PLAYER_ID}`]: playerEnvelope,
    [`/api/v1/players/${EMPTY_PLAYER_ID}`]: emptyPlayerEnvelope,
}

export const guildMock = {
    [`/api/v1/guilds/${GUILD_ID}`]: guildEnvelope,
    [`/api/v1/guilds/${NO_POINTS_GUILD_ID}`]: noPointsGuildEnvelope,
    [`/api/v1/guilds/${EMPTY_GUILD_ID}`]: emptyRosterGuildEnvelope,
}

export const esportsMock = {
    [`/api/v1/players/${PLAYER_ID}/esports`]: esportsEnvelope,
    [`/api/v1/players/${EMPTY_PLAYER_ID}/esports`]: emptyEsportsEnvelope,
}
