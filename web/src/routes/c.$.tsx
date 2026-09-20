import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/c/$")({
    beforeLoad: ({ params }) => {
        throw redirect({
            href: `/stats/clan/${params._splat ?? ""}`,
            statusCode: 308,
        })
    },
})
