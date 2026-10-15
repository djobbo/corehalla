import type { Meta, StoryObj } from "@storybook/react-vite"
import type { ComponentProps } from "react"
import { useState } from "react"
import { SortControl } from "./SortControl"
import type { SortDirection } from "@/lib/useSortBy"

type SortKey = "rating" | "games" | "name"

const choices = [
    { value: "rating", label: "Rating" },
    { value: "games", label: "Games" },
    { value: "name", label: "Name" },
] as const satisfies readonly {
    readonly value: SortKey
    readonly label: string
}[]

const meta = {
    title: "Patterns/Sort control",
    component: SortControl,
    parameters: { layout: "padded" },
} satisfies Meta<typeof SortControl>

export default meta
type Story = StoryObj<typeof meta>

const Interactive = (args: ComponentProps<typeof SortControl>) => {
    const [value, setValue] = useState(args.value)
    const [direction, setDirection] = useState<SortDirection>(args.direction)

    return (
        <SortControl
            {...args}
            value={value}
            onChange={setValue}
            direction={direction}
            onToggleDirection={() =>
                setDirection((current) => (current === "asc" ? "desc" : "asc"))
            }
        />
    )
}

export const Descending: Story = {
    args: {
        label: "Sort by",
        value: "rating",
        choices,
        direction: "desc",
        onChange() {},
        onToggleDirection() {},
    },
    render: (args) => <Interactive {...args} />,
}

export const Ascending: Story = {
    args: {
        label: "Sort by",
        value: "name",
        choices,
        direction: "asc",
        onChange() {},
        onToggleDirection() {},
    },
    render: (args) => <Interactive {...args} />,
}
