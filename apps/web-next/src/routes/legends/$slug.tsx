import { createFileRoute, notFound, redirect } from "@tanstack/react-router"
import { LegendView } from "@/components/legend/LegendView"
import { absoluteUrl } from "@/lib/assets"
import { legendHref, resolveLegend } from "@/lib/legends"
import {
    careerLegendRankingsAtom,
    preloadAtoms,
    useQuery,
} from "@/effect/atoms"

export const Route = createFileRoute("/legends/$slug")({
    loader({ params, context, location }) {
        const legend = resolveLegend(params.slug)

        if (legend === null) {
            throw notFound()
        }

        const href = legendHref(legend)

        if (location.pathname !== href) {
            throw redirect({
                href: `${href}${location.searchStr}${location.hash ? `#${location.hash}` : ""}`,
                statusCode: 301,
            })
        }

        return preloadAtoms(context, [
            careerLegendRankingsAtom(legend.legend_id, "games", 1),
        ])
    },
    head({ params }) {
        const legend = resolveLegend(params.slug)

        if (legend === null) return {}

        return {
            meta: [
                { title: `${legend.bio_name} — Brawlhalla legend — Corehalla` },
                {
                    name: "description",
                    content: `${legend.bio_name}, ${legend.bio_aka}. Fights with ${legend.weapon_one} and ${legend.weapon_two}. Its attributes and the players who main it.`,
                },
            ],
            links: [
                {
                    rel: "canonical",
                    href: absoluteUrl(legendHref(legend)),
                },
            ],
        }
    },
    component: Page,
})

function Page() {
    const legend = resolveLegend(Route.useParams().slug)

    if (legend === null) {
        throw notFound()
    }

    const rows = useQuery(
        careerLegendRankingsAtom(legend.legend_id, "games", 1),
    )

    return <LegendView legend={legend} rows={rows} />
}
