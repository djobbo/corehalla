import type { Meta, StoryObj } from "@storybook/react-vite"
import { EntityPreview } from "./HoverPreview"
import { withMockApi } from "@/storybook/decorators"
import { guildEnvelope, playerEnvelope } from "@/storybook/fixtures"

// The preview is fetched by the id the caller links to; the fixtures carry
// different ids internally, which the component does not read.
const mockApi = {
    "/api/v1/players/1": playerEnvelope,
    "/api/v1/guilds/42": guildEnvelope,
}

const meta = {
    title: "Patterns/Hover preview",
    component: EntityPreview,
    decorators: [withMockApi],
    parameters: { layout: "padded", mockApi },
} satisfies Meta<typeof EntityPreview>

export default meta
type Story = StoryObj<typeof meta>

// Mirrors the 300px surface `HoverCardContent` gives the preview in the app.
const Shell = ({ args }: { args: { type: "player" | "clan"; id: string } }) => (
    <div className="w-[300px] bg-popover p-3 text-popover-foreground shadow-md">
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
