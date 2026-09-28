import { createFileRoute, redirect } from "@tanstack/react-router"

/**
 * The old address of the 3v3 ladder.
 *
 * The ladders are the "live" rankings — current standings, as opposed to the
 * career archive — so the 3v3 ladder lives at `/rankings/live/3v3` now. The
 * region and page segments carry across unchanged, which keeps the indexed URLs
 * working.
 */

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
