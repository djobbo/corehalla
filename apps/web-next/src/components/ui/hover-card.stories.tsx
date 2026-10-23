import type { Meta, StoryObj } from "@storybook/react-vite"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card"

const meta = {
    title: "Components/Hover card",
    component: HoverCard,
    parameters: { layout: "centered" },
} satisfies Meta<typeof HoverCard>

export default meta
type Story = StoryObj<typeof meta>

const PlayerCard = (
    <HoverCardContent>
        <div className="flex flex-col gap-1">
            <span className="font-heading text-sm font-semibold tracking-wider uppercase">
                Mordex
            </span>
            <span className="text-sm text-muted-foreground">
                EU · Diamond II · 1,842 rating
            </span>
        </div>
    </HoverCardContent>
)

export const Default: Story = {
    render: ({ ...args }) => (
        <HoverCard {...args}>
            <HoverCardTrigger
                href="/player/mordex"
                className="text-sm font-medium text-primary underline underline-offset-4"
            >
                @mordex
            </HoverCardTrigger>
            {PlayerCard}
        </HoverCard>
    ),
}

export const Open: Story = {
    render: ({ ...args }) => (
        <HoverCard {...args} defaultOpen>
            <HoverCardTrigger
                href="/player/mordex"
                className="text-sm font-medium text-primary underline underline-offset-4"
            >
                @mordex
            </HoverCardTrigger>
            {PlayerCard}
        </HoverCard>
    ),
}
