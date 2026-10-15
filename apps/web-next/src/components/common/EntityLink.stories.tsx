import type { Meta, StoryObj } from "@storybook/react-vite"
import { EntityLink } from "./EntityLink"
import { clanHref, playerHref } from "@/lib/rankings"
import { withRouter } from "@/storybook/decorators"

const meta = {
    title: "Patterns/Entity link",
    component: EntityLink,
    decorators: [withRouter],
    parameters: { layout: "padded" },
} satisfies Meta<typeof EntityLink>

export default meta
type Story = StoryObj<typeof meta>

export const Player: Story = {
    args: {
        type: "player",
        id: 1,
        href: playerHref(1),
        children: "Mordex",
    },
}

export const Clan: Story = {
    args: {
        type: "clan",
        id: 42,
        href: clanHref(42),
        children: "Wolfpack",
    },
}

export const Inline: Story = {
    args: {
        type: "player",
        id: 1,
        href: playerHref(1),
        children: "Mordex",
        className: "font-semibold",
    },
    render: (args) => (
        <p className="max-w-prose text-sm text-muted-foreground">
            <EntityLink {...args} />
            {" took the set off "}
            <EntityLink
                type="player"
                id={2}
                href={playerHref(2)}
                className="font-semibold"
            >
                Sandstorm
            </EntityLink>
            {" in the grand final."}
        </p>
    ),
}
