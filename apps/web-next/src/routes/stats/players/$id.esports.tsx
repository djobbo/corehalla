import { createFileRoute } from "@tanstack/react-router"
import { EsportsTab } from "@/components/player/EsportsTab"
import { resolveEntityId } from "@/lib/routeParams"
import { playerEsportsAtom, preloadAtoms } from "@/effect/atoms"

export const Route = createFileRoute("/stats/players/$id/esports")({
    loader: ({ params, context }) =>
        preloadAtoms(context, [playerEsportsAtom(resolveEntityId(params.id))]),
    component: Page,
})

function Page() {
    const { id } = Route.useParams()

    return <EsportsTab playerId={resolveEntityId(id)} />
}
