import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/leaderboard/$")({
    beforeLoad: () => {
        throw redirect({ href: "/rankings/1v1", statusCode: 308 })
    },
})
