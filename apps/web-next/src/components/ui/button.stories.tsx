import type { Meta, StoryObj } from "@storybook/react-vite"
import { Button } from "./button"

const meta = {
    title: "Components/Button",
    component: Button,
    parameters: { layout: "centered" },
    argTypes: {
        variant: {
            control: "select",
            options: [
                "default",
                "secondary",
                "outline",
                "ghost",
                "destructive",
                "link",
            ],
        },
        size: {
            control: "select",
            options: [
                "default",
                "xs",
                "sm",
                "lg",
                "icon",
                "icon-xs",
                "icon-sm",
                "icon-lg",
            ],
        },
    },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: { children: "Button" },
}

export const Variants: Story = {
    render: (args) => (
        <div className="flex flex-wrap items-center gap-3">
            {(
                [
                    "default",
                    "secondary",
                    "outline",
                    "ghost",
                    "destructive",
                    "link",
                ] as const
            ).map((variant) => (
                <Button {...args} key={variant} variant={variant}>
                    {variant}
                </Button>
            ))}
        </div>
    ),
}

export const Sizes: Story = {
    render: (args) => (
        <div className="flex flex-wrap items-center gap-3">
            {(["xs", "sm", "default", "lg"] as const).map((size) => (
                <Button {...args} key={size} size={size}>
                    {size}
                </Button>
            ))}
        </div>
    ),
}

export const Disabled: Story = {
    args: { children: "Disabled", disabled: true },
}
