import { createFileRoute } from "@tanstack/react-router"

import RankingsGlobalPage from "../../../pages/rankings/global/[[...rankingsOptions]]"

export const Route = createFileRoute("/rankings/global")({
    component: RankingsGlobalPage,
})
