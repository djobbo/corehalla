import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/stats/player/$")({
    beforeLoad({ params }) {
        throw redirect({
            href: `/stats/players/${params._splat ?? ""}`,
            statusCode: 308,
        })
    },
})
