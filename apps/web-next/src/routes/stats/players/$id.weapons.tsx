import { createFileRoute } from "@tanstack/react-router"
import { WeaponsTab } from "@/components/player/WeaponsTab"
import { resolveEntityId } from "@/lib/routeParams"

export const Route = createFileRoute("/stats/players/$id/weapons")({
    component: Page,
})

function Page() {
    const { id } = Route.useParams()

    return <WeaponsTab playerId={resolveEntityId(id)} />
}
