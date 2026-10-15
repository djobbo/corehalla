import type { Meta, StoryObj } from "@storybook/react-vite"
import { BubbleChart } from "./BubbleChart"
import { legendIconSrc } from "@/lib/assets"
import { playerHref } from "@/lib/rankings"
import type { BubbleNode } from "@/lib/bubbles"

const meta = {
    title: "Patterns/Bubble chart",
    component: BubbleChart,
    parameters: { layout: "padded" },
} satisfies Meta<typeof BubbleChart>

export default meta
type Story = StoryObj<typeof meta>

const bubble = (
    name: string,
    matchtime: number,
    kos: number,
    damage_dealt: number,
    level: number,
    games: number,
    wins: number,
): BubbleNode => ({
    key: name.toLowerCase(),
    name,
    icon: legendIconSrc(name.toLowerCase()),
    href: playerHref(name.toLowerCase()),
    level,
    matchtime,
    kos,
    damage_dealt,
    games,
    wins,
})

const roster: readonly BubbleNode[] = [
    bubble("Bödvar", 18240, 512, 128400, 34, 214, 125),
    bubble("Mordex", 15980, 448, 112300, 31, 188, 104),
    bubble("Diana", 12310, 366, 92100, 27, 151, 79),
    bubble("Nix", 9870, 300, 76400, 23, 122, 66),
    bubble("Val", 7450, 240, 58800, 19, 96, 49),
    bubble("Scarlet", 5120, 168, 41200, 16, 71, 38),
    bubble("Teros", 3980, 141, 33400, 14, 57, 27),
    bubble("Asuri", 2740, 96, 22100, 12, 41, 22),
    bubble("Jhala", 1830, 64, 14700, 10, 30, 15),
    bubble("Kor", 960, 33, 7900, 9, 18, 8),
]

const formatPlaytime = (entry: BubbleNode): string =>
    Math.round(entry.matchtime).toLocaleString()

export const FullRoster: Story = {
    args: {
        bubbles: roster,
        subject: "Legend",
        caption: "Top playtime legends",
        metricHeading: "Playtime",
        formatValue: formatPlaytime,
        scaleExponent: 1.1,
        unit: "played",
        idPrefix: "story-legend",
    },
    render: (args) => (
        <div className="w-[520px] max-w-full">
            <BubbleChart {...args} />
        </div>
    ),
}

export const SparseRoster: Story = {
    args: {
        bubbles: roster.slice(0, 3),
        subject: "Legend",
        caption: "Top playtime legends",
        metricHeading: "Playtime",
        formatValue: formatPlaytime,
        scaleExponent: 1.1,
        unit: "played",
        idPrefix: "story-legend-sparse",
    },
    render: (args) => (
        <div className="w-[520px] max-w-full">
            <BubbleChart {...args} />
        </div>
    ),
}
