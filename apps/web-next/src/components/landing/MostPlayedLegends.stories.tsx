import type { Meta, StoryObj } from "@storybook/react-vite"
import type { LegendMeta } from "@crh/api-contract/schemas"
import { withRouter } from "@/storybook/decorators"
import { landingLegendBoard } from "@/storybook/fixtures"
import { MostPlayedLegends } from "./MostPlayedLegends"

const threeLegends: LegendMeta = {
    ...landingLegendBoard,
    data: landingLegendBoard.data.slice(0, 3),
}

const meta = {
    title: "Features/Landing/Most played legends",
    component: MostPlayedLegends,
    decorators: [withRouter],
    parameters: { layout: "padded" },
    args: { board: landingLegendBoard },
} satisfies Meta<typeof MostPlayedLegends>

export default meta
type Story = StoryObj<typeof meta>

export const FullBoard: Story = {
    parameters: {
        docs: {
            description: {
                story: "The ten strongest legends of the whole-index board, cut to the strip's eight in play-share order.",
            },
        },
    },
}

export const FewerThanEight: Story = {
    args: { board: threeLegends },
    parameters: {
        docs: {
            description: {
                story: "A thin sample renders the rows it has and no filler.",
            },
        },
    },
}

export const NoBoard: Story = {
    args: { board: null },
    parameters: {
        docs: {
            description: {
                story: "When the aggregate fails or has not arrived, the section is absent — the landing keeps every other block and leaves no gap.",
            },
        },
    },
}
