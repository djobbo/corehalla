import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { RankedQueueView } from "@/components/RankedQueueView"
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
