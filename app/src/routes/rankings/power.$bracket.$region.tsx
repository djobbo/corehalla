import RankingsPowerPage from "../../../pages/rankings/power/[[...rankingsOptions]]"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/rankings/power/$bracket/$region")({
    component: RankingsPowerPage,
})
