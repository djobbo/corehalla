import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/rankings/")({
    beforeLoad() {
        throw redirect({ href: "/rankings/live/1v1", statusCode: 308 })
    },
})
