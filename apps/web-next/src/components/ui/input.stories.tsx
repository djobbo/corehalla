import type { Meta, StoryObj } from "@storybook/react-vite"
import { Input } from "./input"

const meta = {
    title: "Components/Input",
    component: Input,
    parameters: { layout: "centered" },
    argTypes: {
        type: {
            control: "select",
            options: ["text", "search", "email", "password", "number"],
        },
    },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: { placeholder: "Search players", className: "w-72" },
}

export const WithValue: Story = {
    args: { defaultValue: "Mordex", className: "w-72" },
}

export const Invalid: Story = {
    args: {
        type: "email",
        defaultValue: "not-an-email",
        "aria-invalid": true,
        className: "w-72",
    },
}

export const Disabled: Story = {
    args: { defaultValue: "Locked", disabled: true, className: "w-72" },
}
