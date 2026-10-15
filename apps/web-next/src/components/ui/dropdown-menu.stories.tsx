import type { Meta, StoryObj } from "@storybook/react-vite"
import { Button } from "./button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "./dropdown-menu"

const meta = {
    title: "Components/Dropdown menu",
    component: DropdownMenu,
    parameters: { layout: "centered" },
} satisfies Meta<typeof DropdownMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    render: ({ ...args }) => (
        <DropdownMenu {...args}>
            <DropdownMenuTrigger render={<Button variant="outline" />}>
                Open menu
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    Profile <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    Settings <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                    Sign out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    ),
}

export const Open: Story = {
    render: ({ ...args }) => (
        <DropdownMenu {...args} defaultOpen>
            <DropdownMenuTrigger render={<Button variant="outline" />}>
                Open menu
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                    Sign out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    ),
}

export const WithSubmenu: Story = {
    render: ({ ...args }) => (
        <DropdownMenu {...args}>
            <DropdownMenuTrigger render={<Button variant="outline" />}>
                Share
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                <DropdownMenuItem>Copy link</DropdownMenuItem>
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Copy as</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        <DropdownMenuItem>Plain text</DropdownMenuItem>
                        <DropdownMenuItem>Markdown</DropdownMenuItem>
                        <DropdownMenuItem>JSON</DropdownMenuItem>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
            </DropdownMenuContent>
        </DropdownMenu>
    ),
}

export const WithChecks: Story = {
    render: ({ ...args }) => (
        <DropdownMenu {...args}>
            <DropdownMenuTrigger render={<Button variant="outline" />}>
                View
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                <DropdownMenuGroup>
                    <DropdownMenuLabel>Panels</DropdownMenuLabel>
                    <DropdownMenuCheckboxItem checked>
                        Ladder
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={false}>
                        Breakdown
                    </DropdownMenuCheckboxItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Region</DropdownMenuLabel>
                <DropdownMenuRadioGroup value="eu">
                    <DropdownMenuRadioItem value="eu" inset>
                        EU
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="na" inset>
                        NA
                    </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    ),
}
