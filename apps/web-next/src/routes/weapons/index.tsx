import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useAtomValue } from "@effect/atom-react"
import { WeaponIndex } from "@/components/weapon/WeaponIndex"
import { absoluteUrl } from "@/lib/assets"
import { isMetaFloor, metaFloorSearch, resolveMetaFloor } from "@/lib/metaFloor"
import {
    preloadAtomsDegraded,
    weaponMetaAtom,
    weaponMetaQueryAtom,
} from "@/effect/atoms"
import type { MetaFloor } from "@crh/api-contract/schemas"

type WeaponIndexSearch = { floor?: MetaFloor }

export const Route = createFileRoute("/weapons/")({
    // The floor lives in the URL, so a sliced board is shareable and a cold
    // load can be server-rendered from the same key the client hydrates.
    validateSearch: (search: Record<string, unknown>): WeaponIndexSearch =>
        isMetaFloor(search.floor) ? { floor: search.floor } : {},
    loaderDeps: ({ search }) => ({
        floor: resolveMetaFloor(search.floor),
    }),
    // Decoration: a failed aggregate drops the table, never the catalogue.
    loader: ({ deps, context }) =>
        preloadAtomsDegraded(context, [], [weaponMetaQueryAtom(deps.floor)]),
    head: () => ({
        meta: [
            { title: "Brawlhalla weapons — Corehalla" },
            {
                name: "description",
                content:
                    "Every Brawlhalla weapon, the legends that wield it and the players with the most career totals on each one.",
            },
        ],
        links: [{ rel: "canonical", href: absoluteUrl("/weapons") }],
    }),
    component: Page,
})

function Page() {
    const { floor: selected } = Route.useSearch()
    const floor = selected ?? "all"
    const navigate = useNavigate()
    const meta = useAtomValue(weaponMetaAtom(floor))

    return (
        <WeaponIndex
            meta={meta}
            floor={floor}
            onFloorChange={(next) =>
                void navigate({
                    to: "/weapons",
                    search: metaFloorSearch(next),
                    replace: true,
                })
            }
        />
    )
}
