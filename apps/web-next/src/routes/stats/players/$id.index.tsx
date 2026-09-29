import { createFileRoute } from "@tanstack/react-router"
import { OverviewTab } from "@/components/player/OverviewTab"
import { resolveEntityId } from "@/lib/routeParams"

export const Route = createFileRoute("/stats/players/$id/")({
    component: Page,
})

function Page() {
    const { id } = Route.useParams()

    return <OverviewTab playerId={resolveEntityId(id)} />
}
