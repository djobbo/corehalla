import { createFileRoute } from "@tanstack/react-router"
import { PlayerTabContent } from "@/components/player/PlayerTabContent"

export const Route = createFileRoute("/stats/player/$playerId/legends")({
    component: Page,
})

function Page() {
    const { playerId } = Route.useParams()

    return <PlayerTabContent playerId={Number(playerId)} tab="legends" />
}
