import {
    createFileRoute,
    Outlet,
    notFound,
    redirect,
} from "@tanstack/react-router"
import { parseEntityId } from "@crh/common/helpers/entitySlug"
import { ProfileLayout } from "@/components/layout/ProfileLayout"
import { PlayerHeader } from "@/components/player/PlayerHeader"
import { PlayerTabs } from "@/components/player/PlayerTabs"
import { canonicalPath } from "@/lib/routeParams"
import {
    dehydrateRegistry,
    playerProfileAtom,
    preloadAtom,
    useQuery,
} from "@/effect/atoms"
import type { PlayerEnvelope } from "@crh/api-contract/schemas"

export const Route = createFileRoute("/stats/players/$id")({
    async loader({ params, context, location }) {
        const playerId = parseEntityId(params.id)

        if (playerId === null) {
            throw notFound()
        }

        let envelope: PlayerEnvelope

        try {
            envelope = (await preloadAtom(
                context.registry,
                playerProfileAtom(playerId),
            )) as PlayerEnvelope
        } catch {
            throw notFound()
        }

        const slug = envelope.data.slug

        if (params.id !== slug) {
            throw redirect({
                href: `${canonicalPath(
                    location.pathname,
                    "/stats/players",
                    params.id,
                    slug,
                )}${location.searchStr}${location.hash ? `#${location.hash}` : ""}`,
                statusCode: 301,
            })
        }

        return import.meta.env.SSR
            ? { dehydrated: dehydrateRegistry(context.registry) }
            : { dehydrated: [] }
    },
    component: Layout,
})

function Layout() {
    const { id } = Route.useParams()
    const profile = useQuery(playerProfileAtom(parseEntityId(id) ?? 0))
    const slug = profile.data.slug

    const show2v2 =
        profile.data.ranked?.["2v2"]?.teams.some((team) => team.paired) ?? false

    return (
        <ProfileLayout aside={<PlayerHeader playerId={profile.data.id} />}>
            <PlayerTabs slug={slug} show2v2={show2v2} />
            <div className="mt-4">
                <Outlet />
            </div>
        </ProfileLayout>
    )
}
