import type { Meta, StoryObj } from "@storybook/react-vite"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
} from "./select"

const meta = {
    title: "Components/Select",
    component: Select,
    parameters: { layout: "centered" },
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

const items = {
    ranked: "Ranked",
    casual: "Casual",
    customs: "Customs",
    experimental: "Experimental",
} as const

const options = (
    <SelectContent>
        <SelectItem value="ranked">Ranked</SelectItem>
        <SelectItem value="casual">Casual</SelectItem>
        <SelectItem value="customs">Customs</SelectItem>
        <SelectItem value="experimental">Experimental</SelectItem>
    </SelectContent>
)

export const Default: Story = {
    render: () => (
        <Select items={items} defaultValue="ranked">
            <SelectTrigger className="w-48">
                <SelectValue placeholder="Select a mode" />
            </SelectTrigger>
            {options}
        </Select>
    ),
}

export const Open: Story = {
    render: () => (
        <Select items={items} defaultValue="casual" defaultOpen>
            <SelectTrigger className="w-48">
                <SelectValue placeholder="Select a mode" />
            </SelectTrigger>
            {options}
        </Select>
    ),
}

export const WithGroups: Story = {
    render: () => (
        <Select items={items} defaultValue="ranked">
            <SelectTrigger className="w-56">
                <SelectValue placeholder="Select a mode" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Ranked</SelectLabel>
                    <SelectItem value="ranked">Ranked</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                </SelectGroup>
                <SelectSeparator />
                <SelectGroup>
                    <SelectLabel>Rotating</SelectLabel>
                    <SelectItem value="customs">Customs</SelectItem>
                    <SelectItem value="experimental">Experimental</SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    ),
}
