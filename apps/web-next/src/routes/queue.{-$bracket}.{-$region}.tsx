import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { RankedQueueView } from "@/components/RankedQueueView"
import { resolveBracket, resolveRegion } from "@/lib/routeParams"
import { preloadAtoms, rankedQueueAtom, useQuery } from "@/effect/atoms"

/**
 * The ranked queue: who queued since the sampler last looked.
 *
 * Bracket and region are path segments rather than component state, for the
 * same reason the ladders use them — a link to "who is playing EU 2v2" is then
 * a link, and the back button moves between ladders instead of leaving the page.
 *
 * The rows are not paged. The sampler only ever records the top 250 of a
 * ladder, and of those only the ones who actually played, so the result is
 * short enough to read whole and there is no second page to go to.
 */
export const Route = createFileRoute("/queue/{-$bracket}/{-$region}")({
    loader: ({ params, context }) =>
        preloadAtoms(context, [
            rankedQueueAtom(
                resolveBracket(params.bracket),
                resolveRegion(params.region),
            ),
        ]),
    component: Page,
})

function Page() {
    const { bracket: bracketParam, region: regionParam } = Route.useParams()

    const bracket = resolveBracket(bracketParam)
    const region = resolveRegion(regionParam)
    const rows = useQuery(rankedQueueAtom(bracket, region))
    const [now, setNow] = useState(0)

    useEffect(() => {
        setNow(Date.now())
    }, [])

    return (
        <main className="ch-page">
            {/*
             * One clock for the whole render, and it arrives after mount.
             *
             * Reading `Date.now()` during the render is what produces a
             * hydration mismatch: the server and the client run it at different
             * moments and produce different strings for the same row. Holding
             * it in state set from an effect means the server renders the
             * column empty and the client fills it in, which is the correct
             * order for a figure that is only ever decorative.
             */}
            <RankedQueueView
                bracket={bracket}
                region={region}
                rows={rows}
                now={now}
            />
        </main>
    )
}
