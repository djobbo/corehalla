import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/wiki")({
    beforeLoad: () => {
        throw redirect({
            href: "https://brawlhalla.wiki.gg",
        })
    },
})
