import PlayerStatsPage from "../../../../pages/stats/player/[playerId]"
import { seoHead } from "@components/SEO"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/stats/player/$playerId")({
    loader: ({ context: { trpcProxy }, params }) =>
        trpcProxy.getPlayerStats.query({ playerId: params.playerId }),
    head: ({ loaderData, params }) =>
        seoHead({
            title: loaderData
                ? `${loaderData.name} - Player Stats • Corehalla`
                : `Player ${params.playerId} • Corehalla`,
            description: loaderData
                ? `${loaderData.name} Stats - Brawlhalla Player Stats • Corehalla`
                : "Brawlhalla player stats on Corehalla",
        }),
    component: PlayerStatsPage,
})
