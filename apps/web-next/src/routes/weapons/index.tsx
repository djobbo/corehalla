import { createFileRoute } from "@tanstack/react-router"
import { WeaponIndex } from "@/components/weapon/WeaponIndex"
import { absoluteUrl } from "@/lib/assets"

export const Route = createFileRoute("/weapons/")({
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
    component: WeaponIndex,
})
