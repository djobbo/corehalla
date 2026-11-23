import type { Meta, StoryObj } from "@storybook/react-vite"
import { LandingFavorites } from "./LandingFavorites"
import { withMockApi } from "@/storybook/decorators"
import type { Favorite } from "@crh/api-contract/schemas"

/** One past the cap, so the story shows the preview and the overflow link. */
const favorites: readonly Favorite[] = [
    { id: "1", type: "player", name: "Mordex", meta: {} },
    { id: "42", type: "clan", name: "Wolfpack", meta: {} },
    { id: "2", type: "player", name: "Sandstorm", meta: {} },
    { id: "43", type: "clan", name: "Kings", meta: {} },
    { id: "3", type: "player", name: "Boomie", meta: {} },
    { id: "4", type: "player", name: "Lucians", meta: {} },
    { id: "5", type: "player", name: "Kyna", meta: {} },
]

const meta = {
    title: "Features/Account/Landing favorites",
    component: LandingFavorites,
    decorators: [withMockApi],
    parameters: { layout: "padded" },
} satisfies Meta<typeof LandingFavorites>

export default meta
type Story = StoryObj<typeof meta>

export const Populated: Story = {
    parameters: { mockApi: { "/api/v1/me/favorites": favorites } },
}

export const NoFavorites: Story = {
    parameters: { mockApi: { "/api/v1/me/favorites": [] } },
}

export const SignedOut: Story = {
    parameters: { mockApi: { "/api/v1/me/session": { user: null } } },
}
