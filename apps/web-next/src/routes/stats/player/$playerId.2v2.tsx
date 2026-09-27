import { createFileRoute } from "@tanstack/react-router"
import { TeamsTab } from "@/components/player/TeamsTab"

export const Route = createFileRoute("/stats/player/$playerId/2v2")({
    component: Page,
})

function Page() {
    const { playerId } = Route.useParams()

    return <TeamsTab playerId={Number(playerId)} />
}
