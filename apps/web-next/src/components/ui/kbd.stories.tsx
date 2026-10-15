import type { Meta, StoryObj } from "@storybook/react-vite"
import { Kbd, KbdGroup } from "./kbd"

const meta = {
    title: "Components/Kbd",
    component: Kbd,
    parameters: { layout: "centered" },
} satisfies Meta<typeof Kbd>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: { children: "⌘K" },
}

export const Group: Story = {
    render: () => (
        <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>⇧</Kbd>
            <Kbd>P</Kbd>
        </KbdGroup>
    ),
}

export const Inline: Story = {
    render: () => (
        <p className="text-sm text-muted-foreground">
            Press <Kbd>⌘K</Kbd> to open the command palette.
        </p>
    ),
}
