import PlayerStatsPage from "../../../../pages/stats/player/[playerId]"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/stats/player/$playerId")({
    component: PlayerStatsPage,
})
