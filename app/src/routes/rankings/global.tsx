import { createFileRoute } from "@tanstack/react-router"
import { RankingsGlobalPage } from "@views/rankings/global"

export const Route = createFileRoute("/rankings/global")({
    component: RankingsGlobalPage,
})
