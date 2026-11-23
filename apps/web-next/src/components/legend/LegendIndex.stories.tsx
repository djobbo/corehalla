import type { Meta, StoryObj } from "@storybook/react-vite"
import { LegendIndex } from "./LegendIndex"
import { withRouter } from "@/storybook/decorators"

const meta = {
    title: "Features/Legend/Legend index",
    component: LegendIndex,
    decorators: [withRouter],
    parameters: { layout: "padded" },
} satisfies Meta<typeof LegendIndex>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
