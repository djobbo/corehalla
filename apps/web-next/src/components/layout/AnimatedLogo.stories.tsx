import type { Meta, StoryObj } from "@storybook/react-vite"
import { AnimatedLogo } from "./AnimatedLogo"

const meta = {
    title: "Features/Layout/Animated logo",
    component: AnimatedLogo,
    parameters: { layout: "fullscreen" },
} satisfies Meta<typeof AnimatedLogo>

export default meta
type Story = StoryObj<typeof meta>

export const Mark: Story = {
    render: () => (
        <div className="flex items-end gap-8 bg-background p-6">
            <AnimatedLogo className="h-24 w-24" />
            <AnimatedLogo className="h-14 w-14" />
            <AnimatedLogo className="h-8 w-8" />
        </div>
    ),
}
