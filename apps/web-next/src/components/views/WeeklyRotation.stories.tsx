import type { Meta, StoryObj } from "@storybook/react-vite"
import { WeeklyRotation } from "./WeeklyRotation"
import { withMockApi } from "@/storybook/decorators"
import type { RotationLegend } from "@/lib/rotation"

const legend = (
    legendId: number,
    nameKey: string,
    bioName: string,
): RotationLegend => ({
    legend_id: legendId,
    legend_name_key: nameKey,
    bio_name: bioName,
    bio_aka: "",
    weapon_one: "Sword",
    weapon_two: "Spear",
    strength: "6",
    dexterity: "5",
    defense: "6",
    speed: "5",
})

const rotation: readonly RotationLegend[] = [
    legend(2, "bodvar", "Bödvar"),
    legend(4, "brynn", "Brynn"),
    legend(1, "ada", "Ada"),
    legend(7, "artemis", "Artemis"),
    legend(8, "asuri", "Asuri"),
    legend(10, "azoth", "Azoth"),
    legend(11, "barraza", "Barraza"),
    legend(13, "caspian", "Caspian"),
    legend(14, "cassidy", "Cassidy"),
]

const meta = {
    title: "Views/Weekly rotation",
    component: WeeklyRotation,
    decorators: [withMockApi],
    parameters: { layout: "padded" },
} satisfies Meta<typeof WeeklyRotation>

export default meta
type Story = StoryObj<typeof meta>

export const Full: Story = { args: { rotation } }

export const Short: Story = { args: { rotation: rotation.slice(0, 8) } }

export const Empty: Story = { args: { rotation: [] } }
