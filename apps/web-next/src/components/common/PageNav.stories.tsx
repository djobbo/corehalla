import type { Meta, StoryObj } from "@storybook/react-vite"
import { PageNav } from "./PageNav"
import { withRouter } from "@/storybook/decorators"

const meta = {
    title: "Patterns/Page nav",
    component: PageNav,
    decorators: [withRouter],
    parameters: { layout: "padded" },
} satisfies Meta<typeof PageNav>

export default meta
type Story = StoryObj<typeof meta>

export const Both: Story = {
    args: { prevHref: "/rankings/1v1/eu/2", nextHref: "/rankings/1v1/eu/4" },
}

export const PreviousOnly: Story = {
    args: { prevHref: "/rankings/1v1/eu/2" },
}

export const NextOnly: Story = {
    args: { nextHref: "/rankings/1v1/eu/2" },
}

export const NoLinks: Story = {
    args: {},
}
