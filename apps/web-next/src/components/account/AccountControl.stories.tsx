import type { Meta, StoryObj } from "@storybook/react-vite"
import { AccountControl } from "./AccountControl"
import { withMockApi } from "@/storybook/decorators"

const meta = {
    title: "Features/Account/Account control",
    component: AccountControl,
    decorators: [withMockApi],
    parameters: { layout: "padded" },
} satisfies Meta<typeof AccountControl>

export default meta
type Story = StoryObj<typeof meta>

// `withMockApi` serves a signed-in session, so the menu trigger renders.
export const SignedIn: Story = {}
