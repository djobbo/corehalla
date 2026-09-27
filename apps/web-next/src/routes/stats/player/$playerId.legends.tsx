import { createFileRoute } from "@tanstack/react-router"
import { LegendsTab } from "@/components/player/LegendsTab"

export const Route = createFileRoute("/stats/player/$playerId/legends")({
    component: Page,
})

function Page() {
    const { playerId } = Route.useParams()

    return <LegendsTab playerId={Number(playerId)} />
}
