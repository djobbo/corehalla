import { createFileRoute, notFound, redirect } from "@tanstack/react-router"
import { parseEntityId } from "@crh/common/helpers/entitySlug"
import { ClanBody } from "@/components/clan/ClanBody"
import { ClanHeader } from "@/components/clan/ClanHeader"
import { canonicalPath } from "@/lib/routeParams"
import { dehydrateRegistry, guildAtom, preloadAtom } from "@/effect/atoms"
import type { GuildEnvelope } from "@crh/api-contract/schemas"

export const Route = createFileRoute("/stats/guilds/$id")({
    async loader({ params, context, location }) {
        const guildId = parseEntityId(params.id)

        if (guildId === null) {
            throw notFound()
        }

        let envelope: GuildEnvelope

        try {
            envelope = (await preloadAtom(
                context.registry,
                guildAtom(guildId),
            )) as GuildEnvelope
        } catch {
            throw notFound()
        }

        if (params.id !== envelope.data.slug) {
            throw redirect({
                href: `${canonicalPath(
                    location.pathname,
                    "/stats/guilds",
                    params.id,
                    envelope.data.slug,
                )}${location.searchStr}${location.hash ? `#${location.hash}` : ""}`,
                statusCode: 301,
            })
        }

        return import.meta.env.SSR
            ? { dehydrated: dehydrateRegistry(context.registry) }
            : { dehydrated: [] }
    },
    component: Page,
})

function Page() {
    const { id } = Route.useParams()
    const guildId = parseEntityId(id) ?? 0

    return (
        <main className="ch-page">
            <ClanHeader clanId={guildId} />
            <div className="mt-4">
                <ClanBody clanId={guildId} />
            </div>
        </main>
    )
}
