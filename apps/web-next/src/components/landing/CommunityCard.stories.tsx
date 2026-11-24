import type { Meta, StoryObj } from "@storybook/react-vite"
import { CommunityCard } from "./CommunityCard"

/**
 * The landing's closing card. It is static, so the stories need no API mock and
 * no router: everything it links to is an absolute external destination.
 */
const meta = {
    title: "Features/Landing/Community card",
    component: CommunityCard,
    parameters: { layout: "padded" },
} satisfies Meta<typeof CommunityCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Narrow: Story = {
    render: () => (
        <div className="w-[320px] max-w-full">
            <CommunityCard />
        </div>
    ),
}
