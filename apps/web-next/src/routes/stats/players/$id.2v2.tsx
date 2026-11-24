import { ClientOnly, createFileRoute } from "@tanstack/react-router"
import { TeamsTab } from "@/components/player/TeamsTab"
import { resolveEntityId } from "@/lib/routeParams"
import { loadedName, playerName, playerTabTitle, titleTags } from "@/lib/seo"

export const Route = createFileRoute("/stats/players/$id/2v2")({
    head: ({ matches, params }) =>
        titleTags(
            playerTabTitle(
                playerName(loadedName(matches), params.id),
                "2v2 Ranked",
            ),
        ),
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
