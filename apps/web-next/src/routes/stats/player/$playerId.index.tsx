import { createFileRoute } from "@tanstack/react-router"
import { OverviewTab } from "@/components/player/OverviewTab"

export const Route = createFileRoute("/stats/player/$playerId/")({
    component: Page,
})

function Page() {
    const { playerId } = Route.useParams()

    return <OverviewTab playerId={Number(playerId)} />
}
