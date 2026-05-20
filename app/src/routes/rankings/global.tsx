import { RankingsGlobalPage } from "#/views/rankings/global"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/rankings/global")({
    component: RankingsGlobalPage,
})
