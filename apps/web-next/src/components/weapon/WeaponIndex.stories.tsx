import type { Meta, StoryObj } from "@storybook/react-vite"
import { WeaponIndex } from "./WeaponIndex"
import { withRouter } from "@/storybook/decorators"

const meta = {
    title: "Features/Weapon/Weapon index",
    component: WeaponIndex,
    decorators: [withRouter],
    parameters: { layout: "padded" },
} satisfies Meta<typeof WeaponIndex>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
