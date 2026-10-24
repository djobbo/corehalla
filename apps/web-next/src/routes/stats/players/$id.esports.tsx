import { ClientOnly, createFileRoute } from "@tanstack/react-router"
import { EsportsTab } from "@/components/player/EsportsTab"
import { resolveEntityId } from "@/lib/routeParams"
import { playerEsportsQueryAtom, preloadAtomsDegraded } from "@/effect/atoms"

export const Route = createFileRoute("/stats/players/$id/esports")({
    loader: ({ params, context }) =>
        preloadAtomsDegraded(context, [
            playerEsportsQueryAtom(resolveEntityId(params.id)),
        ]),
    component: Page,
})

function Page() {
    const { id } = Route.useParams()

    return (
        <ClientOnly fallback={null}>
            <EsportsTab playerId={resolveEntityId(id)} />
        </ClientOnly>
    )
}
