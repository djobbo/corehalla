import { ClientOnly, createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { DailyPuzzle } from "@/components/daily/DailyPuzzle"
import { absoluteUrl } from "@/lib/assets"
import {
    dailyAnswer,
    dailyDateKey,
    loadDailyState,
    recordDailyGuess,
    resumeDailyState,
    saveDailyState,
} from "@/lib/dailyPuzzle"
import { shareUrl } from "@/lib/share"

export const Route = createFileRoute("/daily")({
    head: () => ({
        meta: [
            { title: "Daily legend — Corehalla" },
            {
                name: "description",
                content:
                    "Guess today's Brawlhalla legend in six tries. Weapons and attributes score against the answer, and the round is the same for everyone on the UTC date.",
            },
        ],
        links: [{ rel: "canonical", href: absoluteUrl("/daily") }],
    }),
    component: Page,
})

const Shell = () => (
    <main id="main" tabIndex={-1} className="ch-page">
        <header className="ch-hero mb-3">
            <p className="ch-kicker">Play</p>
            <h1 className="ch-display mt-1 text-2xl md:text-3xl">
                Daily legend
            </h1>
        </header>
    </main>
)

/**
 * `localStorage` only exists in the browser, and the round is read before the
 * board paints so a revisit resumes instead of flashing an empty game.
 */
function DailyRound() {
    const [state, setState] = useState(() =>
        loadDailyState(window.localStorage, dailyDateKey(new Date())),
    )
    const answer = dailyAnswer(state.date)

    const guess = (legendId: number) => {
        const today = dailyDateKey(new Date())
        const next = recordDailyGuess(
            resumeDailyState(state, today),
            legendId,
            dailyAnswer(today).legend_id,
        )

        if (next === state) return

        try {
            saveDailyState(window.localStorage, next)
        } catch {
            // Private mode still plays; only the resume is lost.
        }

        setState(next)
    }

    return (
        <DailyPuzzle
            state={state}
            answer={answer}
            shareUrl={shareUrl(window.location.origin, "/daily")}
            onGuess={guess}
        />
    )
}

function Page() {
    return (
        <ClientOnly fallback={<Shell />}>
            <DailyRound />
        </ClientOnly>
    )
}
