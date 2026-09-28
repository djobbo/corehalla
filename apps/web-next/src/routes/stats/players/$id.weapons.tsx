import { createFileRoute } from "@tanstack/react-router"
import { WeaponsTab } from "@/components/player/WeaponsTab"

export const Route = createFileRoute("/stats/players/$id/weapons")({
    component: Page,
})

function Page() {
    const { id: playerId } = Route.useParams()

    return <WeaponsTab playerId={Number(playerId)} />
}
