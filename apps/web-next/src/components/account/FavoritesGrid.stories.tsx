import type { Meta, StoryObj } from "@storybook/react-vite"
import { FavoritesGrid } from "./FavoritesGrid"
import { withMockApi } from "@/storybook/decorators"
import type { Favorite } from "@crh/api-contract/schemas"

const favorites: readonly Favorite[] = [
    { id: "1", type: "player", name: "Mordex", meta: {} },
    { id: "42", type: "clan", name: "Wolfpack", meta: {} },
]

const meta = {
    title: "Features/Account/Favorites grid",
    component: FavoritesGrid,
    decorators: [withMockApi],
    parameters: { layout: "padded" },
} satisfies Meta<typeof FavoritesGrid>

export default meta
type Story = StoryObj<typeof meta>

export const Populated: Story = { args: { favorites } }

export const Empty: Story = { args: { favorites: [] } }
