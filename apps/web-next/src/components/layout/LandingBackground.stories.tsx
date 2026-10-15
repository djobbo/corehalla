import type { Meta, StoryObj } from "@storybook/react-vite"
import { LandingBackground } from "./LandingBackground"

const meta = {
    title: "Features/Layout/Landing background",
    component: LandingBackground,
    parameters: { layout: "fullscreen" },
} satisfies Meta<typeof LandingBackground>

export default meta
type Story = StoryObj<typeof meta>

export const FullBleed: Story = {
    render: (args) => (
        <div className="relative h-[520px] w-full overflow-hidden bg-background">
            <LandingBackground
                {...args}
                className="absolute inset-0 h-full w-full"
            />
        </div>
    ),
}
