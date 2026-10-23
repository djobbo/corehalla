import type { Meta, StoryObj } from "@storybook/react-vite"
import { PowerRankingsView } from "./PowerRankingsView"
import { withRouter } from "@/storybook/decorators"
import type { PowerRankingsPlayer } from "@crh/api-contract/schemas"

const player = (
    overrides: Pick<
        PowerRankingsPlayer,
        "esportsId" | "playerName" | "powerRanking"
    > &
        Partial<PowerRankingsPlayer>,
): PowerRankingsPlayer => ({
    fullName: null,
    pronoun: null,
    brawlhallaId: null,
    sggPlayerId: null,
    cmPlayerId: null,
    twitter: null,
    twitch: null,
    country: null,
    slug: null,
    top8: 0,
    top32: 0,
    gold: 0,
    silver: 0,
    bronze: 0,
    points: 0,
    earnings: 0,
    ...overrides,
})

const players: readonly PowerRankingsPlayer[] = [
    player({
        esportsId: 1,
        playerName: "Mordex",
        fullName: "Bryan Reiser",
        powerRanking: 1,
        pronoun: "he/him",
        brawlhallaId: 1456,
        country: "US",
        slug: "mordex",
        twitter: "mordex",
        twitch: "mordex",
        top8: 12,
        top32: 21,
        gold: 4,
        silver: 3,
        bronze: 1,
        points: 1187.5,
        earnings: 145_000,
    }),
    player({
        esportsId: 2,
        playerName: "Sandstorm",
        powerRanking: 2,
        brawlhallaId: 2087,
        slug: "sandstorm",
        top8: 9,
        top32: 15,
        gold: 2,
        silver: 2,
        bronze: 3,
        points: 942.25,
        earnings: 88_500,
    }),
    player({
        esportsId: 3,
        playerName: "Boomie",
        powerRanking: 3,
        brawlhallaId: 5312,
        slug: "boomie",
        top8: 7,
        top32: 12,
        gold: 1,
        silver: 4,
        bronze: 2,
        points: 870.75,
        earnings: 61_200,
    }),
    player({
        esportsId: 4,
        playerName: "FreshlyPlaced",
        powerRanking: 4,
        top8: 0,
        top32: 1,
        points: 12,
    }),
]

const meta = {
    title: "Views/Power rankings",
    component: PowerRankingsView,
    decorators: [withRouter],
    parameters: { layout: "padded" },
    args: { onOrderByChange: () => undefined },
} satisfies Meta<typeof PowerRankingsView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {
        gameMode: "1v1",
        region: "NA",
        page: 1,
        orderBy: "powerRanking",
        players,
        totalPages: 3,
        updatedAt: Date.UTC(2026, 9, 15, 12, 0, 0),
    },
}

export const OrderByEarnings: Story = {
    args: {
        gameMode: "2v2",
        region: "EU",
        page: 2,
        orderBy: "earnings",
        players,
        totalPages: 5,
        updatedAt: Date.UTC(2026, 9, 15, 12, 0, 0),
    },
}

export const Empty: Story = {
    args: {
        gameMode: "1v1",
        region: "LAN",
        page: 1,
        orderBy: "points",
        players: [],
        totalPages: 1,
        updatedAt: Date.UTC(2026, 9, 15, 12, 0, 0),
    },
}
