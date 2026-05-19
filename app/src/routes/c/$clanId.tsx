import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/c/$clanId")({
    beforeLoad: ({ params }) => {
        throw redirect({
            to: "/stats/clan/$clanId",
            params: { clanId: params.clanId },
        })
    },
})
