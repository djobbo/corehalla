import type { Decorator, Meta, StoryObj } from "@storybook/react-vite"
import { LandingHero } from "./LandingHero"
import { SearchProvider } from "./Search"
import { withRouter } from "@/storybook/decorators"

/** `LandingHero` embeds `SearchTrigger`, which requires the search provider. */
const withSearchProvider: Decorator = (Story) => (
    <SearchProvider>
        <Story />
    </SearchProvider>
)

const meta = {
    title: "Features/Layout/Landing hero",
    component: LandingHero,
    decorators: [withRouter, withSearchProvider],
    parameters: { layout: "fullscreen" },
} satisfies Meta<typeof LandingHero>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    render: () => <LandingHero />,
}
