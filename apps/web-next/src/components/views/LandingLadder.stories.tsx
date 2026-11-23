import type { Meta, StoryObj } from "@storybook/react-vite"
import { LandingLadder } from "./LandingLadder"
import { withRouter } from "@/storybook/decorators"
import type { LadderLegend, LadderRow } from "@/lib/ladderRows"

const row = (
    rank: number,
    name: string,
    slug: string,
    rating: number,
    region: string,
    legend?: LadderLegend,
): LadderRow => ({
    key: slug,
    rank,
    rating,
    peakRating: rating + 40,
    tier: rank === 1 ? "Valhallan" : "Diamond",
    games: 120,
    wins: 70,
    region,
    members: [{ id: rank, name, slug }],
    legend,
})

const rows: readonly LadderRow[] = [
    row(1, "Mordex", "mordex", 2104, "us-e", {
        name: "Bödvar",
        nameKey: "bodvar",
        href: "/legends/3-bdvar",
    }),
    row(2, "Sandstorm", "sandstorm", 2061, "eu"),
    row(3, "Boomie", "boomie", 1988, "us-e"),
    row(4, "Lucians", "lucians", 1975, "brz"),
    {
        key: "sandstorm-duo",
        rank: 5,
        rating: 1930,
        peakRating: 1970,
        tier: "Diamond",
        games: 90,
        wins: 50,
        region: "eu",
        members: [
            { id: 2087, name: "Sandstorm", slug: "sandstorm" },
            { id: 1456, name: "Mordex", slug: "mordex" },
        ],
    },
    row(6, "FreshlyPlaced", "freshlyplaced", 1200, "sea"),
]

const meta = {
    title: "Views/Landing ladder",
    component: LandingLadder,
    decorators: [withRouter],
    parameters: { layout: "padded" },
} satisfies Meta<typeof LandingLadder>

export default meta
type Story = StoryObj<typeof meta>

export const Preview: Story = { args: { bracket: "1v1", rows } }

export const Short: Story = {
    args: { bracket: "2v2", rows: rows.slice(0, 3) },
}

export const Empty: Story = { args: { bracket: "3v3", rows: [] } }
