import type { Meta, StoryObj } from "@storybook/react-vite"
import { Textarea } from "./textarea"

const meta = {
    title: "Components/Textarea",
    component: Textarea,
    parameters: { layout: "centered" },
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: { placeholder: "Say something about this run…", className: "w-80" },
}

export const WithValue: Story = {
    args: {
        defaultValue: "Clean three-stock against a Diamond queue.",
        className: "w-80",
    },
}

export const Invalid: Story = {
    args: {
        placeholder: "A note is required",
        "aria-invalid": true,
        className: "w-80",
    },
}

export const Disabled: Story = {
    args: { defaultValue: "Locked", disabled: true, className: "w-80" },
}
