import type { Meta, StoryObj } from "@storybook/react-vite"
import { FavoriteButton } from "./FavoriteButton"
import { withMockApi } from "@/storybook/decorators"

const meta = {
    title: "Features/Account/Favorite button",
    component: FavoriteButton,
    decorators: [withMockApi],
    parameters: { layout: "padded" },
} satisfies Meta<typeof FavoriteButton>

export default meta
type Story = StoryObj<typeof meta>

// Already in the mock favorites ("1"/player) → pressed.
export const Saved: Story = {
    args: { type: "player", id: "1", name: "Mordex" },
}

export const NotSaved: Story = {
    args: { type: "player", id: "9999", name: "Sandstorm" },
}

export const Clan: Story = {
    args: { type: "clan", id: "42", name: "Wolfpack" },
}
