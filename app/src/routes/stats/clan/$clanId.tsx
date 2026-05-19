import ClanStatsPage from "../../../../pages/stats/clan/[clanId]"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/stats/clan/$clanId")({
    component: ClanStatsPage,
})
