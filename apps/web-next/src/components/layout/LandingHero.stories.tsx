import type { Meta, StoryObj } from "@storybook/react-vite"
import { LandingHero } from "./LandingHero"
import { withRouter } from "@/storybook/decorators"

const meta = {
    title: "Features/Layout/Landing hero",
    component: LandingHero,
    decorators: [withRouter],
    parameters: { layout: "fullscreen" },
} satisfies Meta<typeof LandingHero>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    render: () => <LandingHero />,
}

/** The hero on the page column, on the same edge as the sections below it. */
export const InPageColumn: Story = {
    render: () => (
        <main className="ch-page">
            <LandingHero />
            <p className="ch-kicker mt-8">Live rankings</p>
            <div className="mt-2 grid gap-6 lg:grid-cols-2">
                <p className="ch-kicker">1v1</p>
                <p className="ch-kicker">2v2</p>
            </div>
        </main>
    ),
}
