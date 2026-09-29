import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/rankings/3v3/{-$region}/{-$page}")({
    beforeLoad({ params }) {
        const region = params.region ? `/${params.region}` : ""
        const page = params.page ? `/${params.page}` : ""

        throw redirect({
            href: `/rankings/live/3v3${region}${page}`,
            statusCode: 308,
        })
    },
})
