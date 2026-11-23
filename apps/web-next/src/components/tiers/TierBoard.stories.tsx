import { legends } from "@crh/bhapi/legends"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { withRouter } from "@/storybook/decorators"
import {
    emptyTierBoard,
    placeLegend,
    tierNames,
    type TierBoard as TierBoardState,
    type TierName,
} from "@/lib/tierList"
import { TierBoard } from "./TierBoard"

const roster = legends.map((legend) => legend.legend_id)

const arrange = (
    groups: Partial<Record<TierName, readonly number[]>>,
): TierBoardState =>
    tierNames.reduce(
        (board, tier) =>
            (groups[tier] ?? []).reduce(
                (next, legendId) => placeLegend(next, legendId, tier),
                board,
            ),
        emptyTierBoard,
    )

const populatedBoard = arrange({
    S: roster.slice(0, 6),
    A: roster.slice(6, 14),
    B: roster.slice(14, 24),
    C: roster.slice(24, 32),
    D: roster.slice(32, 38),
    F: roster.slice(38, 43),
})

const InteractiveBoard = ({
    initialBoard,
}: {
    readonly initialBoard: TierBoardState
}) => {
    const [board, setBoard] = useState(initialBoard)

    return (
        <TierBoard
            board={board}
            onPlace={(legendId, tier) =>
                setBoard((current) => placeLegend(current, legendId, tier))
            }
            onReset={() => setBoard(emptyTierBoard)}
        />
    )
}

const meta = {
    title: "Features/Tiers/Tier board",
    component: TierBoard,
    decorators: [withRouter],
    parameters: { layout: "fullscreen" },
    args: {
        board: emptyTierBoard,
        onPlace() {},
        onReset() {},
    },
} satisfies Meta<typeof TierBoard>

export default meta
type Story = StoryObj<typeof meta>

export const EmptyBoard: Story = {
    render: () => <InteractiveBoard initialBoard={emptyTierBoard} />,
    parameters: {
        docs: {
            description: {
                story: "The board a visitor lands on: six empty tiers, the whole roster in the pool.",
            },
        },
    },
}

export const PopulatedBoard: Story = {
    render: () => <InteractiveBoard initialBoard={populatedBoard} />,
    parameters: {
        docs: {
            description: {
                story: "A ranked board, with every placement reflected in the shareable URL.",
            },
        },
    },
}

export const PoolOnlyBoard: Story = {
    render: () => (
        <div className="w-[375px] max-w-full">
            <InteractiveBoard initialBoard={emptyTierBoard} />
        </div>
    ),
    parameters: {
        docs: {
            description: {
                story: "Nothing ranked, at phone width: the pool and every tier still wrap instead of scrolling the page sideways.",
            },
        },
    },
}
