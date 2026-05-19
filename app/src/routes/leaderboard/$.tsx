import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/leaderboard/$")({
    beforeLoad: () => {
        throw redirect({ to: "/rankings/1v1/{-$region}/{-$page}" })
    },
})
