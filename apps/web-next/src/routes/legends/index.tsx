import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useAtomValue } from "@effect/atom-react"
import { LegendIndex } from "@/components/legend/LegendIndex"
import { LegendMetaBoard } from "@/components/legend/LegendMetaBoard"
import {
    legendMetaAtom,
    legendMetaQueryAtom,
    preloadAtomsDegraded,
} from "@/effect/atoms"
import { isMetaFloor, metaFloorSearch, resolveMetaFloor } from "@/lib/metaFloor"
import {
    legendMetaWeaponSearch,
    resolveLegendMetaWeapon,
} from "@/lib/legendMeta"
import { absoluteUrl } from "@/lib/assets"
import type { MetaFloor } from "@crh/api-contract/schemas"

type LegendIndexSearch = { floor?: MetaFloor; weapon?: string }

export const Route = createFileRoute("/legends/")({
    // The floor and the weapon live in the URL, so a filtered board is
    // shareable and a cold load can be server-rendered from the same key the
    // client hydrates.
    validateSearch: (search: Record<string, unknown>): LegendIndexSearch => ({
        ...(isMetaFloor(search.floor) ? { floor: search.floor } : {}),
        ...legendMetaWeaponSearch(resolveLegendMetaWeapon(search.weapon)),
    }),
    loaderDeps: ({ search }) => ({
        floor: resolveMetaFloor(search.floor),
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
    const { floor: selected, weapon: selectedWeapon } = Route.useSearch()
    const floor = selected ?? "all"
    const weapon = resolveLegendMetaWeapon(selectedWeapon)
    const navigate = useNavigate()
    const board = useAtomValue(legendMetaAtom(floor))

    return (
        <LegendIndex>
            {board === null ? null : (
                <LegendMetaBoard
                    board={board}
                    floor={floor}
                    weapon={weapon}
                    onFloorChange={(next) =>
                        void navigate({
                            to: "/legends",
                            search: {
                                ...metaFloorSearch(next),
                                ...legendMetaWeaponSearch(weapon),
                            },
                            replace: true,
                        })
                    }
                    onWeaponChange={(next) =>
                        void navigate({
                            to: "/legends",
                            search: {
                                ...metaFloorSearch(floor),
                                ...legendMetaWeaponSearch(next),
                            },
                            replace: true,
                        })
                    }
                />
            )}
        </LegendIndex>
    )
}
