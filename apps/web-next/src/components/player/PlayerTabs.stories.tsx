import type { Meta, StoryObj } from "@storybook/react-vite"
import { PlayerTabs } from "./PlayerTabs"
import { withRouter } from "@/storybook/decorators"

const meta = {
    title: "Features/Player/Player tabs",
    component: PlayerTabs,
    decorators: [withRouter],
    parameters: { layout: "padded" },
} satisfies Meta<typeof PlayerTabs>

export default meta
type Story = StoryObj<typeof meta>

export const With2v2: Story = {
    args: { slug: "mordex", show2v2: true },
}

export const Without2v2: Story = {
    args: { slug: "mordex", show2v2: false },
}
