import type { Meta, StoryObj } from "@storybook/react-vite"
import { EntityPreview } from "./HoverPreview"
import { withMockApi } from "@/storybook/decorators"

const meta = {
    title: "Patterns/Hover preview",
    component: EntityPreview,
    decorators: [withMockApi],
    parameters: { layout: "padded" },
} satisfies Meta<typeof EntityPreview>

export default meta
type Story = StoryObj<typeof meta>

// The mock API only serves `/api/v1/me/*`, so the player/guild fetch behind
// `EntityPreview` fails and it renders null — the shell mirrors where the
// preview appears, and null is the loading/empty state it shows in that case.
const Shell = ({ args }: { args: { type: "player" | "clan"; id: string } }) => (
    <div className="min-h-20 w-[300px] rounded-lg border border-border bg-card p-3">
        <EntityPreview {...args} />
    </div>
)

export const Player: Story = {
    args: { type: "player", id: "1" },
    render: (args) => <Shell args={args} />,
}

export const Clan: Story = {
    args: { type: "clan", id: "42" },
    render: (args) => <Shell args={args} />,
}
