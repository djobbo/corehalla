import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { RankedQueueView } from "@/components/views/RankedQueueView"
import { queueHref, regionLabel } from "@/lib/rankings"
import { queueTitle, seoTags } from "@/lib/seo"
import { resolveBracket, resolveRegion } from "@/lib/routeParams"
import { preloadAtoms, rankedQueueAtom, useQuery } from "@/effect/atoms"

export const Route = createFileRoute("/rankings/queues/{-$bracket}/{-$region}")(
    {
        loader: ({ params, context }) =>
            preloadAtoms(context, [
                rankedQueueAtom(
                    resolveBracket(params.bracket),
                    resolveRegion(params.region),
                ),
            ]),
        head({ params }) {
            const bracket = resolveBracket(params.bracket)
            const region = resolveRegion(params.region)

            return seoTags({
                title: queueTitle(bracket, region),
                description: `${bracket} ranked queue for ${regionLabel(region)}: everyone who queued in the last 30 minutes, with rating and tier.`,
                path: queueHref(bracket, region),
            })
        },
        component: Page,
    },
)

function Page() {
    const { bracket: bracketParam, region: regionParam } = Route.useParams()

    const bracket = resolveBracket(bracketParam)
    const region = resolveRegion(regionParam)
    const rows = useQuery(rankedQueueAtom(bracket, region))
    // Set after mount: reading Date.now() during render mismatches SSR hydration.
    const [now, setNow] = useState(0)

    useEffect(() => {
        setNow(Date.now())
    }, [])

    return (
        <main className="ch-page">
            <RankedQueueView
                bracket={bracket}
                region={region}
                rows={rows}
                now={now}
            />
        </main>
    )
}
