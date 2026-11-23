import type { Meta, StoryObj } from "@storybook/react-vite"
import { Footer } from "./Footer"
import { withRouter } from "@/storybook/decorators"

const meta = {
    title: "Features/Layout/Footer",
    component: Footer,
    decorators: [withRouter],
    parameters: { layout: "fullscreen" },
    args: { year: 2026 },
} satisfies Meta<typeof Footer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Narrow: Story = {
    render: (args) => (
        <div className="w-[320px] max-w-full">
            <Footer {...args} />
        </div>
    ),
}
