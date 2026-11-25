import type { Meta, StoryObj } from "@storybook/react-vite"
import type { LegendMeta } from "@crh/api-contract/schemas"
import { withRouter } from "@/storybook/decorators"
import { landingLegendBoard, metaLegendBoard } from "@/storybook/fixtures"
import { LandingLegends } from "./LandingLegends"

const threeLegends: LegendMeta = {
    ...metaLegendBoard,
    data: metaLegendBoard.data.slice(0, 3),
}

const meta = {
    title: "Features/Landing/Landing legends",
    component: LandingLegends,
    decorators: [withRouter],
    parameters: { layout: "padded" },
    args: {
        board: metaLegendBoard,
        floor: "2200",
        title: "Meta legends",
        titleId: "landing-meta-legends",
    },
} satisfies Meta<typeof LandingLegends>

export default meta
type Story = StoryObj<typeof meta>

export const MetaSlice: Story = {
    parameters: {
        docs: {
            description: {
                story: "The 2200+ slice: nine rows on the board, cut to the strip's eight in play-share order, the sample stated under the heading.",
            },
        },
    },
}

export const WholeIndex: Story = {
    args: {
        board: landingLegendBoard,
        floor: "all",
        title: "Most played legends",
        titleId: "landing-legends",
    },
    parameters: {
        docs: {
            description: {
                story: "The same section over the whole index, so the landing can render both strips from one component.",
            },
        },
    },
}

export const FewerThanEight: Story = {
    args: { board: threeLegends },
    parameters: {
        docs: {
            description: {
                story: "A thin slice renders the rows it has and no filler.",
            },
        },
    },
}

export const EmptySlice: Story = {
    args: { board: { ...metaLegendBoard, data: [] } },
    parameters: {
        docs: {
            description: {
                story: "A slice with no games is absent: no heading and no placeholder.",
            },
        },
    },
}

export const OtherFloorBoard: Story = {
    args: { board: landingLegendBoard },
    parameters: {
        docs: {
            description: {
                story: "A whole-index board handed to the 2200 strip renders nothing, so the meta heading never publishes all-index numbers.",
            },
        },
    },
}

export const NoBoard: Story = {
    args: { board: null },
    parameters: {
        docs: {
            description: {
                story: "When the meta aggregate fails or has not arrived, the section is absent — the landing keeps every other block and leaves no gap.",
            },
        },
    },
}
