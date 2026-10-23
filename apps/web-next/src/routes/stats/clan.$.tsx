import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/stats/clan/$")({
    beforeLoad({ params }) {
        throw redirect({
            href: `/stats/guilds/${params._splat ?? ""}`,
            statusCode: 308,
        })
    },
})
