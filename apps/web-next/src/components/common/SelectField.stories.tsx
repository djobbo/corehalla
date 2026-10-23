import type { Meta, StoryObj } from "@storybook/react-vite"
import type { ComponentProps } from "react"
import { useState } from "react"
import { SelectField } from "./SelectField"

type Region = "all" | "eu" | "na" | "sa" | "oce" | "asia" | "jpn"

const regions = [
    { value: "all", label: "All regions" },
    { value: "eu", label: "Europe" },
    { value: "na", label: "North America" },
    { value: "sa", label: "South America" },
    { value: "oce", label: "Oceania" },
    { value: "asia", label: "Asia" },
    { value: "jpn", label: "Japan" },
] as const satisfies readonly {
    readonly value: Region
    readonly label: string
}[]

const meta = {
    title: "Patterns/Select field",
    component: SelectField,
    parameters: { layout: "padded" },
} satisfies Meta<typeof SelectField>

export default meta
type Story = StoryObj<typeof meta>

const Interactive = (args: ComponentProps<typeof SelectField>) => {
    const [value, setValue] = useState(args.value)

    return <SelectField {...args} value={value} onChange={setValue} />
}

export const Default: Story = {
    args: {
        label: "Region",
        value: "eu",
        options: regions,
        onChange() {},
    },
}

export const WithoutLabel: Story = {
    args: {
        value: "all",
        options: regions,
        onChange() {},
    },
}

export const InteractiveOptions: Story = {
    args: {
        label: "Region",
        value: "eu",
        options: regions,
        onChange() {},
    },
    render: (args) => <Interactive {...args} />,
}
