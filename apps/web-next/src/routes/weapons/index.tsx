import { createFileRoute } from "@tanstack/react-router"
import { useAtomValue } from "@effect/atom-react"
import { WeaponIndex } from "@/components/weapon/WeaponIndex"
import { absoluteUrl } from "@/lib/assets"
import {
    preloadAtomsDegraded,
    weaponMetaAtom,
    weaponMetaQueryAtom,
} from "@/effect/atoms"

export const Route = createFileRoute("/weapons/")({
    // Decoration: a failed aggregate drops the table, never the catalogue.
    loader: ({ context }) =>
        preloadAtomsDegraded(context, [], [weaponMetaQueryAtom()]),
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
    return <WeaponIndex meta={useAtomValue(weaponMetaAtom())} />
}
