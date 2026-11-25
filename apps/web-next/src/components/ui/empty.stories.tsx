import type { Meta, StoryObj } from "@storybook/react-vite"
import { Button } from "./button"
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle,
} from "./empty"

const meta = {
    title: "Components/Empty",
    component: Empty,
    parameters: { layout: "padded" },
} satisfies Meta<typeof Empty>

export default meta
type Story = StoryObj<typeof meta>

/** A board that failed to load: one sentence, no label. */
export const SentenceOnly: Story = {
    render: () => (
        <Empty className="rounded-none bg-card shadow-md">
            <EmptyHeader>
                <EmptyDescription>
                    The 1v1 ladder could not be read right now.
                </EmptyDescription>
            </EmptyHeader>
        </Empty>
    ),
}

/** A titled state: one kicker, one sentence. */
export const KickerAndSentence: Story = {
    render: () => (
        <Empty className="rounded-none bg-card shadow-md">
            <EmptyHeader>
                <EmptyTitle>No favorites yet</EmptyTitle>
                <EmptyDescription>
                    Open a player or clan and press &ldquo;Favorite&rdquo;.
                </EmptyDescription>
            </EmptyHeader>
        </Empty>
    ),
}

/** The same shape with the recovery action on the start edge. */
export const WithAction: Story = {
    render: () => (
        <Empty className="rounded-none bg-card shadow-md">
            <EmptyHeader>
                <EmptyTitle>No players found</EmptyTitle>
                <EmptyDescription>
                    Try a different name or clear the active filters.
                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
                <Button variant="outline" size="sm">
                    Clear filters
                </Button>
            </EmptyContent>
        </Empty>
    ),
}

/** Without a slab, for an empty state that sits directly in the page column. */
export const InPageColumn: Story = {
    render: () => (
        <Empty>
            <EmptyHeader>
                <EmptyDescription>
                    Sign in to save the players and clans you follow.
                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
                <Button>Sign in with Discord</Button>
            </EmptyContent>
        </Empty>
    ),
}
