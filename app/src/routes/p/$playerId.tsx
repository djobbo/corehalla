import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/p/$playerId")({
    beforeLoad: ({ params }) => {
        throw redirect({
            to: "/stats/player/$playerId",
            params: { playerId: params.playerId },
        })
    },
})
