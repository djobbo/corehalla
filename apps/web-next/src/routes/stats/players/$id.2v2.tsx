import { ClientOnly, createFileRoute } from "@tanstack/react-router"
import { TeamsTab } from "@/components/player/TeamsTab"
import { resolveEntityId } from "@/lib/routeParams"

export const Route = createFileRoute("/stats/players/$id/2v2")({
    component: Page,
})

function Page() {
    const { id } = Route.useParams()

    return (
        <ClientOnly fallback={null}>
            <TeamsTab playerId={resolveEntityId(id)} />
        </ClientOnly>
    )
}
