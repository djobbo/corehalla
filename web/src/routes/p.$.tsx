import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/p/$")({
    beforeLoad: ({ params }) => {
        throw redirect({
            href: `/stats/player/${params._splat ?? ""}`,
            statusCode: 308,
        })
    },
})
