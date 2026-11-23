import { createFileRoute, redirect } from "@tanstack/react-router"
import { ladderRedirectTarget } from "@/lib/legacyLadder"

export const Route = createFileRoute("/rankings/2v2/{-$region}/{-$page}")({
    beforeLoad({ params }) {
        throw redirect({
            href: ladderRedirectTarget({
                bracket: "2v2",
                region: params.region,
                page: params.page,
            }),
            statusCode: 308,
        })
    },
})
