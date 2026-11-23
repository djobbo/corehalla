import type { Meta, StoryObj } from "@storybook/react-vite"
import { AlertBar } from "./AlertBar"

const meta = {
    title: "Features/Layout/Alert bar",
    component: AlertBar,
    parameters: { layout: "fullscreen" },
} satisfies Meta<typeof AlertBar>

export default meta
type Story = StoryObj<typeof meta>

export const Maintenance: Story = {
    args: { alertKey: "BH_MAINTENANCE" },
}

export const WithLink: Story = {
    args: { alertKey: "NEW_BH_WIKI" },
}

export const Narrow: Story = {
    args: { alertKey: "BH_SERVER_ISSUE" },
    render: (args) => (
        <div className="w-[320px] max-w-full">
            <AlertBar {...args} />
        </div>
    ),
}

export const Unset: Story = {
    args: { alertKey: "NOT_A_KEY" },
}
