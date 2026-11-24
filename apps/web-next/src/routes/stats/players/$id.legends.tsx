import { ClientOnly, createFileRoute } from "@tanstack/react-router"
import { LegendsTab } from "@/components/player/LegendsTab"
import { resolveEntityId } from "@/lib/routeParams"
import { loadedName, playerName, playerTabTitle, titleTags } from "@/lib/seo"

export const Route = createFileRoute("/stats/players/$id/legends")({
    head: ({ matches, params }) =>
        titleTags(
            playerTabTitle(
                playerName(loadedName(matches), params.id),
                "Legends",
            ),
        ),
    component: Page,
})

function Page() {
    const { id } = Route.useParams()

    return (
        <ClientOnly fallback={null}>
            <LegendsTab playerId={resolveEntityId(id)} />
        </ClientOnly>
    )
}
