import { legends } from "@crh/bhapi/legends"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { withRouter } from "@/storybook/decorators"
import {
    MAX_DAILY_GUESSES,
    dailyAnswer,
    freshDailyState,
    recordDailyGuess,
    type DailyState,
} from "@/lib/dailyPuzzle"
import { DailyPuzzle } from "./DailyPuzzle"

const DATE = "2026-11-26"
const SHARE_URL = "https://corehalla.com/daily"
const answer = dailyAnswer(DATE)

const play = (keys: readonly string[]): DailyState =>
    keys.reduce((state, key) => {
        const guess = legends.find((entry) => entry.legend_name_key === key)

        return guess === undefined
            ? state
            : recordDailyGuess(state, guess.legend_id, answer.legend_id)
    }, freshDailyState(DATE))

const misses = legends
    .filter((entry) => entry.legend_id !== answer.legend_id)
    .slice(0, MAX_DAILY_GUESSES)
    .map((entry) => entry.legend_name_key)

const InteractiveDaily = ({ initial }: { readonly initial: DailyState }) => {
    const [state, setState] = useState(initial)

    return (
        <DailyPuzzle
            state={state}
            answer={answer}
            shareUrl={SHARE_URL}
            onGuess={(legendId) =>
                setState((current) =>
                    recordDailyGuess(current, legendId, answer.legend_id),
                )
            }
        />
    )
}

const meta = {
    title: "Features/Daily/Daily legend",
    component: DailyPuzzle,
    decorators: [withRouter],
    parameters: { layout: "fullscreen" },
    args: {
        state: freshDailyState(DATE),
        answer,
        shareUrl: SHARE_URL,
        onGuess() {},
    },
} satisfies Meta<typeof DailyPuzzle>

export default meta
type Story = StoryObj<typeof meta>

export const EmptyRound: Story = {
    render: () => <InteractiveDaily initial={freshDailyState(DATE)} />,
    parameters: {
        docs: {
            description: {
                story: "A first visit: six guesses, an empty board and a streak of zero. The form plays for real in the workshop.",
            },
        },
    },
}

export const MidRound: Story = {
    render: () => (
        <InteractiveDaily initial={play(["bodvar", "cassidy", "orion"])} />
    ),
    parameters: {
        docs: {
            description: {
                story: "Three guesses in, each row scoring its two weapons and four attributes against the answer.",
            },
        },
    },
}

export const Win: Story = {
    render: () => (
        <InteractiveDaily
            initial={play(["bodvar", "cassidy", answer.legend_name_key])}
        />
    ),
    parameters: {
        docs: {
            description: {
                story: "The answer guessed on the third try: the reveal links to the legend and the result is ready to copy.",
            },
        },
    },
}

export const Loss: Story = {
    render: () => <InteractiveDaily initial={play(misses)} />,
    parameters: {
        docs: {
            description: {
                story: "Six misses: the answer is revealed, the streak resets, and the share block still gives nothing away.",
            },
        },
    },
}
