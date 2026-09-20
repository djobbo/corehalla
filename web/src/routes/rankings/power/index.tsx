import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/rankings/power/")({
    beforeLoad() {
        throw redirect({ href: "/rankings/power/1v1", statusCode: 308 })
    },
})
