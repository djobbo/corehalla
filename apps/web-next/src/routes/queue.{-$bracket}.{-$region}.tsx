import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/queue/{-$bracket}/{-$region}")({
    beforeLoad({ params }) {
        const bracket = params.bracket
        const region = params.region
        const suffix = region ? `/${region}` : ""

        throw redirect({
            href: `/rankings/queues/${bracket ?? "1v1"}${suffix}`,
            statusCode: 308,
        })
    },
})
