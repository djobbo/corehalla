import type { Meta, StoryObj } from "@storybook/react-vite"
import { Button } from "./button"
import { Kbd } from "./kbd"
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip"

const meta = {
    title: "Components/Tooltip",
    component: Tooltip,
    parameters: { layout: "centered" },
} satisfies Meta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    render: ({ ...args }) => (
        <Tooltip {...args}>
            <TooltipTrigger render={<Button variant="outline" />}>
                Peak rating
            </TooltipTrigger>
            <TooltipContent>Highest rating this season: 1,904</TooltipContent>
        </Tooltip>
    ),
}

export const Open: Story = {
    render: ({ ...args }) => (
        <Tooltip {...args} defaultOpen>
            <TooltipTrigger render={<Button variant="outline" />}>
                Peak rating
            </TooltipTrigger>
            <TooltipContent>Highest rating this season: 1,904</TooltipContent>
        </Tooltip>
    ),
}

export const WithShortcut: Story = {
    render: ({ ...args }) => (
        <Tooltip {...args}>
            <TooltipTrigger render={<Button variant="ghost" size="icon-sm" />}>
                ⌘
            </TooltipTrigger>
            <TooltipContent>
                Toggle theme <Kbd>⌘K</Kbd>
            </TooltipContent>
        </Tooltip>
    ),
}
