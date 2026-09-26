import { createFileRoute } from "@tanstack/react-router"
import { ClanBody, ClanIdentity } from "@/components/clan/ClanBody"
import { clanStatsAtom, preloadAtoms } from "@/effect/atoms"

/**
 * A clan's page.
 *
 * A shared link lands here and so does a reload, which is the property that
 * matters: the URL is what describes the clan.
 */
export const Route = createFileRoute("/stats/clan/$clanId")({
    loader: ({ params, context }) =>
        preloadAtoms(context, [clanStatsAtom(Number(params.clanId))]),
    component: Page,
})

function Page() {
    const { clanId } = Route.useParams()

    return (
        <main className="p-4">
            <ClanIdentity clanId={Number(clanId)} />
            <div className="mt-4">
                <ClanBody clanId={Number(clanId)} />
            </div>
        </main>
    )
}
