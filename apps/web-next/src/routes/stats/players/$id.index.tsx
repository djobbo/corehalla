import { createFileRoute } from "@tanstack/react-router"
import { OverviewTab } from "@/components/player/OverviewTab"

export const Route = createFileRoute("/stats/players/$id/")({
    component: Page,
})

function Page() {
    const { id: playerId } = Route.useParams()

    return <OverviewTab playerId={Number(playerId)} />
}
