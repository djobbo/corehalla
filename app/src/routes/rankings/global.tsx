import RankingsGlobalPage from "../../../pages/rankings/global/[[...rankingsOptions]]"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/rankings/global")({
    component: RankingsGlobalPage,
})
