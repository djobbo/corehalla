import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { CalcView, type CalcViewProps } from "./CalcView"
import type { ComponentProps } from "react"

const meta = {
    title: "Views/Calc view",
    component: CalcView,
    parameters: { layout: "fullscreen" },
} satisfies Meta<typeof CalcView>

export default meta
type Story = StoryObj<typeof meta>

const Interactive = (args: CalcViewProps) => {
    const [hasTenGames, setHasTenGames] = useState(args.hasTenGames)
    const [wins, setWins] = useState(args.wins)
    const [bestRating, setBestRating] = useState(args.bestRating)
    const [personalRating, setPersonalRating] = useState(args.personalRating)
    const [legendRating, setLegendRating] = useState(args.legendRating)

    return (
        <CalcView
            {...args}
            hasTenGames={hasTenGames}
            wins={wins}
            bestRating={bestRating}
            personalRating={personalRating}
            legendRating={legendRating}
            onHasTenGamesChange={setHasTenGames}
            onWinsChange={setWins}
            onBestRatingChange={setBestRating}
            onPersonalRatingChange={setPersonalRating}
            onLegendRatingChange={setLegendRating}
        />
    )
}

const baseArgs: ComponentProps<typeof CalcView> = {
    hasTenGames: true,
    wins: "150",
    bestRating: "2000",
    personalRating: "1400",
    legendRating: "1500",
    onHasTenGamesChange() {},
    onWinsChange() {},
    onBestRatingChange() {},
    onPersonalRatingChange() {},
    onLegendRatingChange() {},
}

export const Default: Story = {
    args: baseArgs,
    render: (storyArgs) => <Interactive {...storyArgs} />,
}

export const NotEnoughGames: Story = {
    args: {
        ...baseArgs,
        hasTenGames: false,
        wins: "",
        bestRating: "",
    },
    render: (storyArgs) => <Interactive {...storyArgs} />,
}

export const ExtremeRatings: Story = {
    args: {
        ...baseArgs,
        wins: "9999",
        bestRating: "4000",
        personalRating: "4000",
        legendRating: "5000",
    },
    render: (storyArgs) => <Interactive {...storyArgs} />,
}
