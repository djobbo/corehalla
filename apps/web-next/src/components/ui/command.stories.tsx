import type { Meta, StoryObj } from "@storybook/react-vite"
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "./command"

const meta = {
    title: "Components/Command",
    component: Command,
    parameters: { layout: "centered" },
} satisfies Meta<typeof Command>

export default meta
type Story = StoryObj<typeof meta>

const commands = (
    <>
        <CommandInput placeholder="Search commands…" />
        <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Pages">
                <CommandItem>
                    Profile <CommandShortcut>⌘P</CommandShortcut>
                </CommandItem>
                <CommandItem>Ladder</CommandItem>
                <CommandItem>News</CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Actions">
                <CommandItem>Toggle theme</CommandItem>
                <CommandItem>Copy link</CommandItem>
            </CommandGroup>
        </CommandList>
    </>
)

export const Default: Story = {
    render: () => (
        <Command className="w-[28rem] border border-border shadow-md">
            {commands}
        </Command>
    ),
}

export const InDialog: Story = {
    render: () => (
        <CommandDialog open>
            <Command>{commands}</Command>
        </CommandDialog>
    ),
}
