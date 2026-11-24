import { ClientOnly, createFileRoute } from "@tanstack/react-router"
import { WeaponsTab } from "@/components/player/WeaponsTab"
import { resolveEntityId } from "@/lib/routeParams"
import { loadedName, playerName, playerTabTitle, titleTags } from "@/lib/seo"

export const Route = createFileRoute("/stats/players/$id/weapons")({
    head: ({ matches, params }) =>
        titleTags(
            playerTabTitle(
                playerName(loadedName(matches), params.id),
                "Weapons",
            ),
        ),
    component: Page,
})

function Page() {
    const { id } = Route.useParams()

    return (
        <ClientOnly fallback={null}>
            <WeaponsTab playerId={resolveEntityId(id)} />
        </ClientOnly>
    )
}
