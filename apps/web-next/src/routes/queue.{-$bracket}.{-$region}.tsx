import { createFileRoute, redirect } from "@tanstack/react-router"

/**
 * The old address of the queue board.
 *
 * The queue is a rankings surface, so it lives under `/rankings/queues` now
 * rather than at a bare `/queue`. This exists only to keep the indexed URLs
 * alive: `/queue/1v1` carries over to `/rankings/queues/1v1` with the bracket
 * and region segments intact.
 */

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
