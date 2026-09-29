import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/rankings/career/")({
    beforeLoad() {
        throw redirect({ href: "/rankings/career/players", statusCode: 308 })
    },
})
