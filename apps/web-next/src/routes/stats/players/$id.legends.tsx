import { createFileRoute } from "@tanstack/react-router"
import { LegendsTab } from "@/components/player/LegendsTab"

export const Route = createFileRoute("/stats/players/$id/legends")({
    component: Page,
})

function Page() {
    const { id: playerId } = Route.useParams()

    return <LegendsTab playerId={Number(playerId)} />
}
