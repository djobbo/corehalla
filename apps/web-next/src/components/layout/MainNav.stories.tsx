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

const renderNav = () => (
    <div className="w-[760px] max-w-full bg-background p-4">
        <MainNav />
    </div>
)

export const Default: Story = { render: renderNav }

export const WeaponCatalogue: Story = {
    parameters: { routerPath: "/weapons/grapple-hammer" },
    render: renderNav,
}
