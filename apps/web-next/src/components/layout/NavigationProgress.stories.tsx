import type { Meta, StoryObj } from "@storybook/react-vite"
import { NavigationProgress } from "./NavigationProgress"
import { withRouter } from "@/storybook/decorators"

const meta = {
    title: "Features/Layout/Navigation progress",
    component: NavigationProgress,
    decorators: [withRouter],
    parameters: { layout: "fullscreen" },
} satisfies Meta<typeof NavigationProgress>

export default meta
type Story = StoryObj<typeof meta>

/*
 * The bar only mounts while `router.state.isLoading` is true; the decorator's
 * memory router never navigates, so this renders the surrounding masthead with
 * the progress bar idle.
 */
export const Idle: Story = {
    render: () => (
        <div className="relative w-full bg-background">
            <header className="border-b border-border px-6 py-4">
                <p className="ch-kicker">Masthead</p>
            </header>
            <NavigationProgress />
        </div>
    ),
}
