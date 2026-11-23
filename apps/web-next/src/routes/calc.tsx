import { createFileRoute } from "@tanstack/react-router"
import { CalcView } from "@/components/views/CalcView"
import { useState } from "react"

export const Route = createFileRoute("/calc")({
    // Every value comes from local input, so the page needs no loader and reads
    // the same on the server and after hydration.
    head: () => ({
        meta: [
            { title: "Glory / ELO reset calculator — Corehalla" },
            {
                name: "description",
                content:
                    "Work out your end-of-season Brawlhalla glory from your ranked wins and best rating, and the rating your account and legends reset to.",
            },
        ],
    }),
    component: Page,
})

function Page() {
    const [hasTenGames, setHasTenGames] = useState(false)
    const [wins, setWins] = useState("")
    const [bestRating, setBestRating] = useState("")
    const [personalRating, setPersonalRating] = useState("")
    const [legendRating, setLegendRating] = useState("")

    return (
        <CalcView
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
