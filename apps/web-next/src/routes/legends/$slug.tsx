import {
    createFileRoute,
    notFound,
    redirect,
    useNavigate,
} from "@tanstack/react-router"
import { useAtomValue } from "@effect/atom-react"
import { LegendView } from "@/components/legend/LegendView"
import { absoluteUrl } from "@/lib/assets"
import { legendHref, resolveLegend } from "@/lib/legends"
import { isMetaFloor, metaFloorSearch, resolveMetaFloor } from "@/lib/metaFloor"
import {
    careerLegendRankingsAtom,
    legendMetaAtom,
    legendMetaQueryAtom,
    preloadAtomsDegraded,
    useQuery,
} from "@/effect/atoms"
import type { MetaFloor } from "@crh/api-contract/schemas"

type LegendSlugSearch = { floor?: MetaFloor }

export const Route = createFileRoute("/legends/$slug")({
    // The floor lives in the URL, so a sliced page is shareable and a cold load
    // can be server-rendered from the same key the client hydrates.
    validateSearch: (search: Record<string, unknown>): LegendSlugSearch =>
        isMetaFloor(search.floor) ? { floor: search.floor } : {},
    loaderDeps: ({ search }) => ({
        floor: resolveMetaFloor(search.floor),
    }),
    loader({ params, context, location, deps }) {
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

        return preloadAtomsDegraded(
            context,
            [careerLegendRankingsAtom(legend.legend_id, "games", 1)],
            // Decoration: a slow or failed aggregate drops the card, never the page.
            [legendMetaQueryAtom(deps.floor)],
        )
    },
    head({ params }) {
        const legend = resolveLegend(params.slug)

        if (legend === null) return {}

        return {
            meta: [
                { title: `${legend.bio_name} — Brawlhalla legend — Corehalla` },
                {
                    name: "description",
                    content: `${legend.bio_name}, ${legend.bio_aka}. Fights with ${legend.weapon_one} and ${legend.weapon_two}. Its attributes, how it plays and the players who main it.`,
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
    const { slug } = Route.useParams()
    const { floor: selected } = Route.useSearch()
    const floor = selected ?? "all"
    const navigate = useNavigate()
    const legend = resolveLegend(slug)

    if (legend === null) {
        throw notFound()
    }

    const rows = useQuery(
        careerLegendRankingsAtom(legend.legend_id, "games", 1),
    )
    const board = useAtomValue(legendMetaAtom(floor))
    const playStyle =
        board?.data.find((row) => row.legendId === legend.legend_id)
            ?.playStyle ?? null

    return (
        <LegendView
            legend={legend}
            rows={rows}
            playStyle={playStyle}
            meta={board}
            floor={floor}
            onFloorChange={(next) =>
                void navigate({
                    to: "/legends/$slug",
                    params: { slug },
                    search: metaFloorSearch(next),
                    replace: true,
                })
            }
        />
    )
}
