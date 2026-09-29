import { createFileRoute } from "@tanstack/react-router"
import { LegendsTab } from "@/components/player/LegendsTab"
import { resolveEntityId } from "@/lib/routeParams"

export const Route = createFileRoute("/stats/players/$id/legends")({
    component: Page,
})

function Page() {
    const { id } = Route.useParams()

    return <LegendsTab playerId={resolveEntityId(id)} />
}
