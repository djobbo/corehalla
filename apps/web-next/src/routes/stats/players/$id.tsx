import {
    ClientOnly,
    createFileRoute,
    Outlet,
    notFound,
    redirect,
} from "@tanstack/react-router"
import { parseEntityId } from "@crh/common/helpers/entitySlug"
import { ProfileLayout } from "@/components/layout/ProfileLayout"
import { PageLoaderProbe } from "@/components/layout/PageLoader"
import { PlayerHeader } from "@/components/player/PlayerHeader"
import { PlayerTabs } from "@/components/player/PlayerTabs"
import { canonicalPath } from "@/lib/routeParams"
import { Cause, Option } from "effect"
import {
    dehydrateRegistry,
    playerProfileAtom,
    playerProfileQueryAtom,
    preloadAtom,
    useQuery,
} from "@/effect/atoms"
import type { PlayerProfileEnvelope } from "@crh/api-contract/schemas"

export const Route = createFileRoute("/stats/players/$id")({
    async loader({ params, context, location }) {
        const playerId = parseEntityId(params.id)

        if (playerId === null) {
            throw notFound()
        }

        let envelope: PlayerProfileEnvelope | null = null
        let degraded = false

        try {
            envelope = (await preloadAtom(
                context.registry,
                playerProfileQueryAtom(playerId),
            )) as PlayerProfileEnvelope
        } catch (error) {
            // A real 404 stays a 404. Everything else is an upstream problem
            // the client hydration pass can repair from the browser.
            if (isNotFound(error)) throw notFound()

            degraded = true
        }

        if (envelope !== null) {
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
        }

        return import.meta.env.SSR
            ? {
                  dehydrated: degradeSafe(degraded, context.registry),
                  degraded,
              }
            : { dehydrated: [], degraded }
    },
    component: Layout,
})

const isNotFound = (error: unknown): boolean => {
    if ((error as { _tag?: string } | null)?._tag === "NotFound") return true

    const cause = (error as { cause?: Cause.Cause<unknown> } | null)?.cause

    if (cause === undefined) return false

    return Option.match(Cause.findErrorOption(cause), {
        onNone: () => false,
        onSome: (failure) => (failure as { _tag?: string })._tag === "NotFound",
    })
}

/**
 * A failed preload must not be serialized: the browser atom has to run again
 * so its fallback layer can take over.
 */
const degradeSafe = (
    degraded: boolean,
    registry: Parameters<typeof dehydrateRegistry>[0],
) => (degraded ? [] : dehydrateRegistry(registry))

const DegradedPlayerShell = () => (
    <main className="ch-page">
        <PageLoaderProbe />
    </main>
)

function PlayerLayout() {
    const { id } = Route.useParams()
    const profile = useQuery(playerProfileAtom(parseEntityId(id) ?? 0))
    const slug = profile.data.slug

    const show2v2 = profile.data.has_2v2

    return (
        <ProfileLayout aside={<PlayerHeader playerId={profile.data.id} />}>
            <PlayerTabs slug={slug} show2v2={show2v2} />
            <div className="mt-4">
                <Outlet />
            </div>
        </ProfileLayout>
    )
}

function Layout() {
    const { degraded } = Route.useLoaderData()

    if (degraded) {
        return (
            <ClientOnly fallback={<DegradedPlayerShell />}>
                <PlayerLayout />
            </ClientOnly>
        )
    }

    return <PlayerLayout />
}
