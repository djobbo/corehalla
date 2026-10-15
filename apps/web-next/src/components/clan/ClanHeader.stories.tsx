import type { Meta, StoryObj } from "@storybook/react-vite"
import { ClanHeader } from "./ClanHeader"
import { registerMockRoute, withMockApi } from "@/storybook/decorators"

const updatedAt = Date.UTC(2026, 9, 15, 12, 0, 0)

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
    meta: { updated_at: updatedAt },
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
    meta: { updated_at: updatedAt },
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
    meta: { updated_at: updatedAt },
}

registerMockRoute("/api/v1/guilds/4242", guildEnvelope)
registerMockRoute("/api/v1/guilds/4243", noPointsGuildEnvelope)
registerMockRoute("/api/v1/guilds/4244", emptyRosterGuildEnvelope)

const meta = {
    title: "Features/Clan/Clan header",
    component: ClanHeader,
    decorators: [withMockApi],
    parameters: { layout: "padded" },
    excludeStories:
        /^(guildEnvelope|noPointsGuildEnvelope|emptyRosterGuildEnvelope)$/,
} satisfies Meta<typeof ClanHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: { clanId: 4242 },
}

export const NoGuildPoints: Story = {
    args: { clanId: 4243 },
}
