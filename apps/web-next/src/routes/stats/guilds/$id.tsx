import { createFileRoute, notFound, redirect } from "@tanstack/react-router"
import { parseEntityId } from "@crh/common/helpers/entitySlug"
import { ClanBody } from "@/components/clan/ClanBody"
import { ClanHeader } from "@/components/clan/ClanHeader"
import {
    dehydrateRegistry,
    guildAtom,
    preloadAtom,
} from "@/effect/atoms"
import type { GuildEnvelope } from "@crh/api-contract/schemas"

/**
 * A clan's page.
 *
 * A shared link lands here and so does a reload, which is the property that
 * matters: the URL is what describes the clan. As on a profile, the segment is a
 * slug (`9-the-guild`) and a request whose name half does not match what the API
 * reports is redirected to the canonical one.
 */
export const Route = createFileRoute("/stats/guilds/$id")({
    async loader({ params, context }) {
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
            // Same contract as a profile: an unknown guild and an unreadable
            // one both mean there is no page to render here.
            throw notFound()
        }

        if (params.id !== envelope.data.slug) {
            throw redirect({
                href: `/stats/guilds/${envelope.data.slug}`,
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
