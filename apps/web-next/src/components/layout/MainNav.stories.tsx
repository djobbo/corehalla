import type { Meta, StoryObj } from "@storybook/react-vite"
import { MainNav } from "./MainNav"
import { withRouter } from "@/storybook/decorators"

const meta = {
    title: "Features/Layout/Main nav",
    component: MainNav,
    decorators: [withRouter],
    parameters: { layout: "fullscreen" },
} satisfies Meta<typeof MainNav>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    render: () => (
        <div className="w-[760px] max-w-full bg-background p-4">
            <MainNav />
        </div>
    ),
}
