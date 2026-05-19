import HomePage from "../../pages/index"
import { seoHead } from "@components/SEO"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
    head: () =>
        seoHead({
            title: "Track your Brawlhalla stats, view rankings, and more! • Corehalla",
            description:
                "Improve your Brawlhalla Game, and find your place among the Elite with our in-depth Player and Clan stats tracking and live leaderboards.",
        }),
    component: HomePage,
})
