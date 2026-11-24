import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useAtomValue } from "@effect/atom-react"
import { LegendIndex } from "@/components/legend/LegendIndex"
import { LegendMetaBoard } from "@/components/legend/LegendMetaBoard"
import {
    legendMetaAtom,
    legendMetaQueryAtom,
    preloadAtomsDegraded,
} from "@/effect/atoms"
import { isLegendMetaFloor, resolveLegendMetaFloor } from "@/lib/legendMeta"
import { absoluteUrl } from "@/lib/assets"
import type { LegendMetaFloor } from "@crh/api-contract/schemas"

type LegendIndexSearch = { floor?: LegendMetaFloor }

export const Route = createFileRoute("/legends/")({
    // The floor lives in the URL, so a filtered board is shareable and a cold
    // load can be server-rendered from the same key the client hydrates.
    validateSearch: (search: Record<string, unknown>): LegendIndexSearch =>
        isLegendMetaFloor(search.floor) ? { floor: search.floor } : {},
    loaderDeps: ({ search }) => ({
        floor: resolveLegendMetaFloor(search.floor),
    }),
    loader: ({ deps, context }) =>
        // Decoration: a failed aggregate hides the board, never the roster.
        preloadAtomsDegraded(context, [], [legendMetaQueryAtom(deps.floor)]),
    head: () => ({
        meta: [
            { title: "Brawlhalla legends — Corehalla" },
            {
                name: "description",
                content:
                    "Every Brawlhalla legend, the weapons they carry, plus play share and win rate across Corehalla's indexed accounts.",
            },
        ],
        links: [{ rel: "canonical", href: absoluteUrl("/legends") }],
    }),
    component: Page,
})

function Page() {
    const { floor: selected } = Route.useSearch()
    const floor = selected ?? "all"
    const navigate = useNavigate()
    const board = useAtomValue(legendMetaAtom(floor))

    return (
        <LegendIndex>
            {board === null ? null : (
                <LegendMetaBoard
                    board={board}
                    floor={floor}
                    onFloorChange={(next) =>
                        void navigate({
                            to: "/legends",
                            search: next === "all" ? {} : { floor: next },
                            replace: true,
                        })
                    }
                />
            )}
        </LegendIndex>
    )
}
