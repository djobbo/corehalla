import type { Meta, StoryObj } from "@storybook/react-vite"
import { SearchIcon } from "lucide-react"
import { Button } from "./button"
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "./empty"

const meta = {
    title: "Components/Empty",
    component: Empty,
    parameters: { layout: "centered" },
} satisfies Meta<typeof Empty>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    render: ({ ...args }) => (
        <Empty {...args} className="w-96 border border-border">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <SearchIcon />
                </EmptyMedia>
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

export const TitleOnly: Story = {
    render: ({ ...args }) => (
        <Empty {...args} className="w-96 border border-border">
            <EmptyHeader>
                <EmptyTitle>Nothing here yet</EmptyTitle>
            </EmptyHeader>
        </Empty>
    ),
}

export const WithMedia: Story = {
    render: ({ ...args }) => (
        <Empty {...args} className="w-96 border border-border">
            <EmptyHeader>
                <EmptyMedia>
                    <SearchIcon className="size-10" />
                </EmptyMedia>
                <EmptyTitle>Search the ladder</EmptyTitle>
                <EmptyDescription>
                    Enter a player name to see their ranked history.
                </EmptyDescription>
            </EmptyHeader>
        </Empty>
    ),
}
