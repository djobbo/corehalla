import { createFileRoute } from "@tanstack/react-router"
import { ClanBody } from "@/components/clan/ClanBody"
import { ClanHeader } from "@/components/clan/ClanHeader"
import { clanStatsAtom, preloadAtoms } from "@/effect/atoms"

/**
 * A clan's page.
 *
 * A shared link lands here and so does a reload, which is the property that
 * matters: the URL is what describes the clan.
 */
export const Route = createFileRoute("/stats/guilds/$id")({
    loader: ({ params, context }) =>
        preloadAtoms(context, [clanStatsAtom(Number(params.id))]),
    component: Page,
})

function Page() {
    const { id: clanId } = Route.useParams()

    return (
        <main className="ch-page">
            <ClanHeader clanId={Number(clanId)} />
            <div className="mt-4">
                <ClanBody clanId={Number(clanId)} />
            </div>
        </main>
    )
}
