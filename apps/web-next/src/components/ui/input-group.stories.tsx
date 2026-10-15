import type { Meta, StoryObj } from "@storybook/react-vite"
import { SearchIcon, XIcon } from "lucide-react"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
    InputGroupText,
    InputGroupTextarea,
} from "./input-group"

const meta = {
    title: "Components/Input group",
    component: InputGroup,
    parameters: { layout: "centered" },
} satisfies Meta<typeof InputGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    render: ({ ...args }) => (
        <InputGroup {...args} className="w-80">
            <InputGroupAddon align="inline-start">
                <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput placeholder="Search players…" />
            <InputGroupAddon align="inline-end">
                <InputGroupButton size="icon-xs" aria-label="Clear search">
                    <XIcon />
                </InputGroupButton>
            </InputGroupAddon>
        </InputGroup>
    ),
}

export const WithText: Story = {
    render: ({ ...args }) => (
        <InputGroup {...args} className="w-80">
            <InputGroupAddon align="inline-start">
                <InputGroupText>https://</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput defaultValue="corehalla.gg" />
        </InputGroup>
    ),
}

export const WithTextarea: Story = {
    render: ({ ...args }) => (
        <InputGroup {...args} className="w-80">
            <InputGroupTextarea placeholder="Describe the bug…" />
            <InputGroupAddon align="block-end">
                <InputGroupText>Markdown supported</InputGroupText>
                <InputGroupButton
                    variant="default"
                    size="xs"
                    className="ml-auto"
                >
                    Post
                </InputGroupButton>
            </InputGroupAddon>
        </InputGroup>
    ),
}
