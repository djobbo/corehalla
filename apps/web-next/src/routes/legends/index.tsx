import { createFileRoute } from "@tanstack/react-router"
import { LegendIndex } from "@/components/legend/LegendIndex"
import { absoluteUrl } from "@/lib/assets"

export const Route = createFileRoute("/legends/")({
    head: () => ({
        meta: [
            { title: "Brawlhalla legends — Corehalla" },
            {
                name: "description",
                content:
                    "Every Brawlhalla legend, the weapons they carry, their attributes and the players who main them.",
            },
        ],
        links: [{ rel: "canonical", href: absoluteUrl("/legends") }],
    }),
    component: LegendIndex,
})
