import { createFileRoute } from "@tanstack/react-router"
import { WeaponsTab } from "@/components/player/WeaponsTab"

export const Route = createFileRoute("/stats/player/$playerId/weapons")({
    component: Page,
})

function Page() {
    const { playerId } = Route.useParams()

    return <WeaponsTab playerId={Number(playerId)} />
}
