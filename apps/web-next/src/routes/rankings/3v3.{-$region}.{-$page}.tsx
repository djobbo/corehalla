import { createFileRoute, redirect } from "@tanstack/react-router"
import { ladderRedirectTarget } from "@/lib/legacyLadder"

export const Route = createFileRoute("/rankings/3v3/{-$region}/{-$page}")({
    beforeLoad({ params }) {
        throw redirect({
            href: ladderRedirectTarget({
                bracket: "3v3",
                region: params.region,
                page: params.page,
            }),
            statusCode: 308,
        })
    },
})
